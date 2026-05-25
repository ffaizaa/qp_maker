const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text.' });

  const prompt = `You are a strict document classifier for a school question paper generator. Read the document carefully and decide if it qualifies as a valid academic document.

VALID documents must satisfy ALL of the following:
- It is a textbook chapter, past exam paper, academic study notes, or academic article
- It contains actual subject-matter content such as: scientific theories and experiments, historical events with dates and facts, geographical descriptions of places and landforms, mathematical problems and formulas, or English literature passages and analysis
- It is clearly written as curriculum material that a student would study to learn a subject
- It is in one of exactly these five subjects: History, Geography, Science (Physics/Chemistry/Biology), Mathematics, or English Literature

INVALID documents — reject ALL of the following without exception:
- Personal plans, career roadmaps, coding plans, 12-week plans, or learning schedules
- Any document that is ABOUT learning or planning rather than actual subject content
- Programming tutorials, coding guides, DSA study plans, LeetCode problems, software development content
- Computer science or IT content of any kind
- Study timetables, revision schedules, or topic checklists
- Self-improvement, productivity, or motivational content
- Business, legal, medical, or financial documents
- Invoices, receipts, contracts, reports, CVs, cover letters
- Any subject outside the five listed above (no Computer Science, Economics, Psychology, Law, etc.)
- Documents with fewer than 80 words of real subject content

KEY TEST before answering: Ask yourself — "Could a school teacher write an exam question directly from this content about History, Geography, Science, Mathematics, or English Literature?" If the answer is NO, it is NOT_ACADEMIC.

Respond with exactly one line in this format:
ACADEMIC: <subject name>
or
NOT_ACADEMIC: <one-line reason why it was rejected>

Do not write anything else. Do not use JSON. Do not add explanation.

DOCUMENT:
${text.slice(0, 4000)}`;

  try {
    const raw = (await model.generateContent(prompt)).response.text().trim();

    if (raw.startsWith('ACADEMIC')) {
      // Extract subject from "ACADEMIC: History"
      const subject = raw.includes(':') ? raw.split(':')[1].trim() : 'Unknown';
      return res.json({ academic: true, subject });
    }

    if (raw.startsWith('NOT_ACADEMIC')) {
      const reason = raw.includes(':') ? raw.split(':').slice(1).join(':').trim() : 'Not a valid academic document.';
      return res.json({ academic: false, reason });
    }

    // Response did not start with either expected token — treat as rejection
    console.error('Unexpected classifier response:', raw.slice(0, 120));
    return res.json({ academic: false, reason: 'Document validation could not be completed. Please try again.' });

  } catch (err) {
    console.error('Classification error:', err.message);
    return res.json({ academic: false, reason: 'Document validation could not be completed. Please try again.' });
  }
});

module.exports = router;
