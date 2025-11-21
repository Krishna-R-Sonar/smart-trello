// backend/routes/cards.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createCard, updateCard, moveCard } = require('../controllers/cardController');

router.post('/:boardId', protect, createCard);
router.put('/:id', protect, updateCard);
router.post('/:boardId/move', protect, moveCard);

module.exports = router;