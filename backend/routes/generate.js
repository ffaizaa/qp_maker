const express = require('express');
const router = express.Router();

// Mock — replaced with Gemini in Feature 5
router.post('/', (req, res) => {
  const { config } = req.body;
  if (!config) return res.status(400).json({ error: 'Missing config' });

  const counts = config.counts || {};
  const questions = [];
  let id = 1;

  for (let i = 0; i < (counts['MCQ'] || 0); i++, id++) {
    questions.push({
      id,
      type: 'MCQ',
      question: `Sample MCQ question ${i + 1} based on the uploaded document.`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: 'Option A',
    });
  }

  for (let i = 0; i < (counts['Short Question'] || 0); i++, id++) {
    questions.push({
      id,
      type: 'Short Question',
      question: `Sample short question ${i + 1} based on the uploaded document.`,
      answer: 'Sample short answer.',
    });
  }

  for (let i = 0; i < (counts['Broad Question'] || 0); i++, id++) {
    questions.push({
      id,
      type: 'Broad Question',
      question: `Sample broad question ${i + 1} based on the uploaded document.`,
      answer: 'Sample broad answer with detailed explanation.',
    });
  }

  for (let i = 0; i < (counts['True/False'] || 0); i++, id++) {
    questions.push({
      id,
      type: 'True/False',
      question: `Sample true/false statement ${i + 1} based on the uploaded document.`,
      answer: 'True',
    });
  }

  res.json({
    title: config.title || 'Question Paper',
    questions,
  });
});

module.exports = router;
