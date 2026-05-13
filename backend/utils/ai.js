const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateAIResponse = async (prompt, systemPrompt = "You are a helpful study assistant.") => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key is missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const fullPrompt = `${systemPrompt}\n\nUser Question/Task: ${prompt}`;
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error details:", error);
    throw new Error("AI Generation failed: " + (error.message || "Unknown error"));
  }
};

module.exports = { generateAIResponse };
