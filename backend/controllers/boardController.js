// backend/controllers/boardController.js
const Board = require('../models/Board');
const Card = require('../models/Card');
const User = require('../models/User');
const { getRecommendations } = require('../utils/smartRecommendations');

const DEFAULT_LISTS = [
  { title: 'To Do', order: 0, cards: [] },
  { title: 'In Progress', order: 1, cards: [] },
  { title: 'Done', order: 2, cards: [] }
];

const normalizeId = (value) => {
  if (!value) return '';
  if (value._id) return value._id.toString();
  return value.toString();
};

const isBoardMember = (board, userId) => {
  if (!board || !userId) return false;
  const targetId = userId.toString();
  if (normalizeId(board.owner) === targetId) return true;
  return board.members.some(memberId => normalizeId(memberId) === targetId);
};

const broadcastBoardUpdate = (io, boardId) => {
  if (io && boardId) {
    io.to(boardId.toString()).emit('board:updated', boardId.toString());
  }
};

const hydrateBoard = async (board) => {
  const cards = await Card.find({ boardId: board._id }).sort({ createdAt: 1 }).lean();
  const normalizedCards = cards.map(card => ({
    ...card,
    _id: card._id.toString(),
    listId: card.listId.toString(),
    labels: card.labels || []
  }));

  const cardMap = normalizedCards.reduce((acc, card) => {
    acc[card._id] = card;
    return acc;
  }, {});

  const boardObject = board.toObject();
  boardObject.lists = [...board.lists]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(list => {
    const listObject = list.toObject();
    listObject._id = listObject._id.toString();
    listObject.cards = list.cards
      .map(cardId => cardMap[cardId.toString()])
      .filter(Boolean);
    return listObject;
  });

  return { board: boardObject, cards: normalizedCards };
};

const createBoard = async (req, res) => {
  const { title } = req.body;

  try {
    const board = new Board({
      title,
      owner: req.user._id,
      members: [req.user._id],
      lists: DEFAULT_LISTS.map(list => ({ ...list, cards: [] }))
    });

    await board.save();
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { boards: board._id } });

    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    })
      .populate('owner', 'name email')
      .sort({ updatedAt: -1 });

    res.json(boards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getInvitedBoards = async (req, res) => {
  try {
    const invites = await Board.find({
      invites: req.user.email.toLowerCase()
    }).populate('owner', 'name email');

    res.json(invites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (!isBoardMember(board, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { board: hydratedBoard, cards } = await hydrateBoard(board);
    const recommendations = getRecommendations(hydratedBoard, cards);

    res.json({ ...hydratedBoard, recommendations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const inviteUser = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email?.toLowerCase();

  if (!normalizedEmail) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only owner can invite' });
    }

    if (normalizedEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({ message: 'You cannot invite yourself' });
    }

    const targetUser = await User.findOne({ email: normalizedEmail });
    if (targetUser) {
      const isAlreadyMember = board.members.some(memberId => memberId.toString() === targetUser._id.toString());
      if (isAlreadyMember) {
        return res.status(400).json({ message: 'User is already a member' });
      }
    }

    const inviteExists = board.invites.includes(normalizedEmail);
    if (!inviteExists) {
      board.invites.push(normalizedEmail);
      await board.save();
    }

    res.json({ message: `Invite sent to ${normalizedEmail}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const acceptInvite = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const userEmail = req.user.email.toLowerCase();
    const inviteIndex = board.invites.findIndex(invite => invite === userEmail);

    if (inviteIndex === -1) {
      return res.status(404).json({ message: 'No invite found for this user' });
    }

    board.invites.splice(inviteIndex, 1);
    if (!board.members.some(memberId => memberId.toString() === req.user._id.toString())) {
      board.members.push(req.user._id);
    }

    await Promise.all([
      board.save(),
      User.findByIdAndUpdate(req.user._id, { $addToSet: { boards: board._id } })
    ]);

    broadcastBoardUpdate(req.io, board._id);
    res.json({ message: 'Invite accepted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addList = async (req, res) => {
  const { title } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({ message: 'List title is required' });
  }

  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (!isBoardMember(board, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const newList = {
      title: title.trim(),
      order: board.lists.length,
      cards: []
    };

    board.lists.push(newList);
    await board.save();

    broadcastBoardUpdate(req.io, board._id);
    res.status(201).json(board.lists[board.lists.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRecommendationsForBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (!isBoardMember(board, req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { board: hydratedBoard, cards } = await hydrateBoard(board);
    const recommendations = getRecommendations(hydratedBoard, cards);

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createBoard,
  getMyBoards,
  getInvitedBoards,
  getBoard,
  inviteUser,
  acceptInvite,
  addList,
  getRecommendationsForBoard
};
