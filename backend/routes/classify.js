const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text.' });

  const prompt = `You are a strict document classifier for a question paper generator tool.

Decide if the text below comes from a proper academic study document that a student or teacher would use.

ALLOWED (academic: true):
- Textbooks, study notes, lecture notes, academic papers, past exam papers, worksheets
- Educational articles or chapters on any school/university subject (Science, Mathematics, English, History, Geography, Biology, Chemistry, Physics, Literature, Economics, Computer Science, etc.)
- The content must have enough explanatory, descriptive, or conceptual material to generate meaningful exam questions from

NOT ALLOWED (academic: false):
- Invoices, receipts, legal contracts, medical reports, business documents, personal letters, financial statements
- Isolated code snippets or source code files with no educational explanation around them
- Random images or screenshots with minimal text (fewer than 50 meaningful words)
- Social media posts, chat logs, or random web page content
- Any document that does not contain enough content to generate at least 3 meaningful exam questions

Reply with ONLY a valid JSON object — no markdown, no explanation:
{"academic": true, "subject": "Biology"}
or
{"academic": false, "reason": "This appears to be an isolated code snippet with no educational explanation."}

DOCUMENT (first 3000 characters):
${text.slice(0, 3000)}`;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim()
      .replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (err) {
    console.error('Classification error:', err.message);
    // On failure, allow through (fail open) so upload errors don't block users
    res.json({ academic: true, subject: 'Unknown' });
  }
});

module.exports = router;
