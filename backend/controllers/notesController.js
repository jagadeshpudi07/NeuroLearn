const pdf = require('pdf-parse');
const fs = require('fs');


const { notes } = require('../utils/db');

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
    fs.appendFileSync('backend.log', `PDF Error: ${error.stack}\n`);
    console.error('PDF Processing Error:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
};