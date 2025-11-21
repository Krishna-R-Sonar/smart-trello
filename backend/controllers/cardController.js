// backend/controllers/cardController.js
const mongoose = require('mongoose');
const Card = require('../models/Card');
const Board = require('../models/Board');

const ensureBoardAccess = async (boardId, userId) => {
  const board = await Board.findById(boardId);
  if (!board) {
    const error = new Error('Board not found');
    error.statusCode = 404;
    throw error;
  }

  const isMember = board.owner.toString() === userId.toString() ||
    board.members.some(memberId => memberId.toString() === userId.toString());

  if (!isMember) {
    const error = new Error('Insufficient permissions');
    error.statusCode = 403;
    throw error;
  }

  return board;
};

const broadcastBoardUpdate = (io, boardId) => {
  if (io && boardId) {
    io.to(boardId.toString()).emit('board:updated', boardId.toString());
  }
};

const createCard = async (req, res) => {
  const { title, description, listId, dueDate, labels } = req.body;
  const { boardId } = req.params;

  try {
    const board = await ensureBoardAccess(boardId, req.user._id);
    const list = board.lists.id(listId);

    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const card = new Card({
      title,
      description,
      listId: list._id,
      boardId,
      dueDate: dueDate || null,
      labels: labels || [],
      createdBy: req.user._id
    });

    await card.save();
    list.cards.push(card._id);
    await board.save();

    broadcastBoardUpdate(req.io, boardId);
    res.status(201).json(card);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

const updateCard = async (req, res) => {
  const { id } = req.params;
  const allowedFields = ['title', 'description', 'dueDate', 'labels'];

  try {
    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    await ensureBoardAccess(card.boardId, req.user._id);

    Object.keys(req.body).forEach(field => {
      if (allowedFields.includes(field)) {
        card[field] = req.body[field];
      }
    });

    await card.save();
    broadcastBoardUpdate(req.io, card.boardId);
    res.json(card);
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

const moveCard = async (req, res) => {
  const { sourceListId, destListId, cardId } = req.body;
  const { boardId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).json({ message: 'Invalid card id' });
  }

  try {
    const [board, card] = await Promise.all([
      ensureBoardAccess(boardId, req.user._id),
      Card.findById(cardId)
    ]);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    if (card.boardId.toString() !== boardId.toString()) {
      return res.status(400).json({ message: 'Card does not belong to board' });
    }

    const sourceList = board.lists.id(sourceListId);
    const destList = board.lists.id(destListId);

    if (!sourceList || !destList) {
      return res.status(404).json({ message: 'List not found' });
    }

    sourceList.cards = sourceList.cards.filter(id => id.toString() !== cardId.toString());
    destList.cards.push(card._id);
    card.listId = destList._id;

    await Promise.all([board.save(), card.save()]);
    broadcastBoardUpdate(req.io, boardId);

    res.json({ message: 'Card moved' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

module.exports = { createCard, updateCard, moveCard };