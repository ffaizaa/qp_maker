const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

function buildPrompt(text, config) {
  const { difficulty, counts } = config;

  const questionLines = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([type, n]) => {
      if (type === 'MCQ') return `- ${n} MCQ question(s), each with exactly 4 options labeled A, B, C, D, and a correct answer field containing the full text of the correct option`;
      if (type === 'True/False') return `- ${n} True/False question(s) with an answer field of either "True" or "False"`;
      if (type === 'Short Question') return `- ${n} Short Question(s) with a concise answer field (1–3 sentences)`;
      if (type === 'Broad Question') return `- ${n} Broad Question(s) with a detailed answer field (a full paragraph)`;
      if (type === 'Math Problem') return `- ${n} Math Problem(s): write each as a self-contained, solvable mathematical problem (equation, calculation, proof step, or word problem) in the same style and topic as the problems in the document. Do NOT mention the document, reference it, or use phrases like "based on the document" or "according to the text". Include a "steps" field showing step-by-step working and an "answer" field with the final result`;
      return '';
    })
    .join('\n');

  return `You are an expert teacher creating a question paper strictly based on the document below.
Use ONLY information from the document. Do NOT invent facts.

Difficulty level: ${difficulty}

Generate the following questions:
${questionLines}

Return ONLY a valid JSON object — no markdown, no explanation — in this exact structure:
{
  "title": "${config.title || 'Question Paper'}",
  "questions": [
    {
      "id": 1,
      "type": "MCQ",
      "question": "...",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "answer": "Option A text"
    },
    {
      "id": 2,
      "type": "True/False",
      "question": "...",
      "answer": "True"
    },
    {
      "id": 3,
      "type": "Short Question",
      "question": "...",
      "answer": "..."
    },
    {
      "id": 4,
      "type": "Broad Question",
      "question": "...",
      "answer": "..."
    },
    {
      "id": 5,
      "type": "Math Problem",
      "question": "Solve for x: 2x + 6 = 14",
      "steps": "Step 1: 2x = 14 - 6 = 8\nStep 2: x = 8 / 2 = 4",
      "answer": "x = 4"
    }
  ]
}

Rules:
- Every question must have "id", "type", "question", and "answer" fields.
- MCQ must also have "options" (array of exactly 4 strings). The "answer" must be the full text of the correct option, matching one of the options exactly.
- True/False "answer" must be exactly "True" or "False".
- Math Problem must also have a "steps" field with clear step-by-step working, and "answer" with the final result.
- Assign sequential integer ids starting at 1.
- Never reference the document in any question text. Do not use phrases like "based on the document", "according to the passage", "as stated in the text", or similar. Every question must read as a standalone question.
- Do not include any text outside the JSON object.

DOCUMENT:
${text.slice(0, 30000)}`;
}

function validatePaper(data, counts) {
  if (typeof data !== 'object' || !Array.isArray(data.questions)) return false;

  const expected = Object.entries(counts).filter(([, n]) => n > 0);
  const total = expected.reduce((s, [, n]) => s + n, 0);
  if (data.questions.length !== total) return false;

  for (const q of data.questions) {
    if (!q.id || !q.type || !q.question) return false;
    if (q.type === 'MCQ') {
      if (!q.answer) return false;
      if (!Array.isArray(q.options) || q.options.length !== 4) return false;
      if (!q.options.includes(q.answer)) return false;
    } else if (q.type === 'True/False') {
      if (q.answer !== 'True' && q.answer !== 'False') return false;
    } else if (q.type === 'Math Problem') {
      if (!q.answer || !q.steps) return false;
    } else {
      if (!q.answer) return false;
    }
  }

  return true;
}

async function callGemini(prompt) {
  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  // Strip markdown code fences if present
  const json = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(json);
}

router.post('/', async (req, res) => {
  const { text, config } = req.body;

  if (!text || !config || !config.counts) {
    return res.status(400).json({ error: 'Missing text or config.' });
  }

  const total = Object.values(config.counts).reduce((s, n) => s + (n || 0), 0);
  if (total === 0) return res.status(400).json({ error: 'No questions requested.' });


  const prompt = buildPrompt(text, config);

  let data;
  try {
    data = await callGemini(prompt);
  } catch (err) {
    console.error('Gemini attempt 1 failed [status=%s]: %s', err.status ?? 'n/a', err.message);
    // Retry once
    try {
      data = await callGemini(prompt);
    } catch (err2) {
      console.error('Gemini attempt 2 failed [status=%s]: %s', err2.status ?? 'n/a', err2.message);
      return res.status(502).json({ error: 'AI generation failed. Please try again.' });
    }
  }

  if (!validatePaper(data, config.counts)) {
    console.error('Validation failed, retrying. Got:', JSON.stringify(data).slice(0, 300));
    try {
      data = await callGemini(prompt);
    } catch (err) {
      return res.status(502).json({ error: 'AI returned malformed output. Please try again.' });
    }
    if (!validatePaper(data, config.counts)) {
      return res.status(502).json({ error: 'AI returned malformed output after retry. Please try again.' });
    }
  }

  res.json(data);
});

module.exports = router;
