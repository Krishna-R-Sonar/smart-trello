// backend/routes/boards.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createBoard,
  getMyBoards,
  getInvitedBoards,
  getBoard,
  inviteUser,
  acceptInvite,
  addList,
  getRecommendationsForBoard
} = require('../controllers/boardController');

router.post('/', protect, createBoard);
router.get('/', protect, getMyBoards);
router.get('/me/invites', protect, getInvitedBoards);
router.get('/:id/recommendations', protect, getRecommendationsForBoard);
router.post('/:id/lists', protect, addList);
router.get('/:id', protect, getBoard);
router.post('/:id/invite', protect, inviteUser);
router.post('/:id/accept', protect, acceptInvite);

module.exports = router;