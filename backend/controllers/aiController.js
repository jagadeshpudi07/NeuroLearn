const { generateAIResponse } = require('../utils/ai');
const { notes } = require('../utils/db');

const getNoteText = (noteId) => {
  const note = notes.find(n => n.id === noteId);
  return note ? note.text : null;
};

exports.generateQuiz = async (req, res) => {
  const { noteId, existingQ = [] } = req.body;
  const text = getNoteText(noteId);
  if (!text) return res.status(404).json({ error: 'Note not found' });

  try {
    let prompt = `Based on the following text, generate a quiz with 5 multiple choice questions. 
    Return ONLY a JSON array in this format: [{"id": 1, "text": "Question?", "options": ["A", "B", "C", "D"], "answer": "A"}].\n`;

    if (existingQ.length > 0) {
      prompt += `IMPORTANT: Do NOT generate questions about the following topics/terms as they have already been covered:\n${existingQ.map(q => "- " + q).join('\n')}\nFocus on completely new material from the text.\n`;
    }

    prompt += `\nText: ${text.substring(0, 5000)}`;

    const responseText = await generateAIResponse(prompt);
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Invalid AI Response format");
    
    const quiz = JSON.parse(jsonMatch[0]);
    res.json({ quiz });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateFlashcards = async (req, res) => {
  const { noteId, existingQ = [] } = req.body;
  const text = getNoteText(noteId);
  if (!text) return res.status(404).json({ error: 'Note not found' });

  try {
    let prompt = `Based on the following text, generate 5 flashcards. 
    Return ONLY a JSON array in this format: [{"q": "Question/Term", "a": "Answer/Definition"}].\n`;
    
    if (existingQ.length > 0) {
      prompt += `IMPORTANT: Do NOT generate questions about the following topics/terms as they have already been covered:\n${existingQ.map(q => "- " + q).join('\n')}\nFocus on completely new material from the text.\n`;
    }
    
    prompt += `\nText: ${text.substring(0, 5000)}`;

    const responseText = await generateAIResponse(prompt);
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Invalid AI Response format");

    const cards = JSON.parse(jsonMatch[0]);
    res.json({ cards });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.generateSummary = async (req, res) => {
  const { noteId } = req.body;
  const text = getNoteText(noteId);
  if (!text) return res.status(404).json({ error: 'Note not found' });

  try {
    const prompt = `Summarize the following text in a concise and professional way.
    Text: ${text.substring(0, 5000)}`;

    const summary = await generateAIResponse(prompt);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.chat = async (req, res) => {
  const { question, noteId } = req.body;
  const text = getNoteText(noteId);
  if (!text) return res.status(404).json({ error: 'Note not found' });

  try {
    const prompt = `User Question: ${question}
    Reference Context: ${text.substring(0, 5000)}`;

    const response = await generateAIResponse(prompt, "You are an AI Study Assistant. Answer the user's question based on the provided notes.");
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};