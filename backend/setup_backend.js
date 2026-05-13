const fs = require('fs');
const path = require('path');

const files = {
  'routes/authRoutes.js': `const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);

module.exports = router;`,

  'routes/notesRoutes.js': `const express = require('express');
const router = express.Router();
const { uploadNote } = require('../controllers/notesController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload', authMiddleware, upload.single('pdf'), uploadNote);

module.exports = router;`,

  'routes/aiRoutes.js': `const express = require('express');
const router = express.Router();
const { generateQuiz, chat } = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate-quiz', authMiddleware, generateQuiz);
router.post('/chat', authMiddleware, chat);

module.exports = router;`,

  'controllers/authController.js': `const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock DB
const users = [];

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), name, email, password: hashedPassword };
  users.push(user);
  res.status(201).json({ message: 'User created' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
};`,

  'controllers/notesController.js': `const pdf = require('pdf-parse');
const fs = require('fs');
const genAI = require('../utils/gemini');

// Mock DB
const notes = [];

exports.uploadNote = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);
    const extractedText = data.text;
    
    const noteId = Date.now().toString();
    notes.push({ id: noteId, user_id: req.user.userId, text: extractedText });
    
    res.json({ message: 'Note uploaded successfully', noteId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process PDF' });
  }
};`,

  'controllers/aiController.js': `const genAI = require('../utils/gemini');

exports.generateQuiz = async (req, res) => {
  const { noteId } = req.body;
  res.json({ quiz: [{ q: 'Sample Q?', options: ['A', 'B', 'C', 'D'], answer: 'A' }] });
};

exports.chat = async (req, res) => {
  const { question, noteId } = req.body;
  res.json({ response: 'Sample AI Response' });
};`,

  'middleware/authMiddleware.js': `const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};`,

  'utils/gemini.js': `const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
module.exports = genAI;`,

  '.env': `PORT=5000
JWT_SECRET=supersecret
GEMINI_API_KEY=`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}
console.log('Backend files generated successfully.');
