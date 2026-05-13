const express = require('express');
const router = express.Router();
const { uploadNote } = require('../controllers/notesController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload', authMiddleware, upload.single('pdf'), uploadNote);

module.exports = router;