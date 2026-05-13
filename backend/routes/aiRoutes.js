const express = require('express');
const router = express.Router();
const { generateQuiz, generateFlashcards, generateSummary, chat } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate-quiz', authMiddleware, generateQuiz);
router.post('/generate-flashcards', authMiddleware, generateFlashcards);
router.post('/generate-summary', authMiddleware, generateSummary);
router.post('/chat', authMiddleware, chat);

module.exports = router;