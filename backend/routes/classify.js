const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text.' });

  const prompt = `You are a strict document classifier for a school question paper generator. Read the document carefully and decide if it qualifies as a valid academic document.

VALID documents — accept if the document CONTAINS actual academic subject matter:
- Textbook chapters, past exam papers, academic study notes, or academic articles
- Reading/comprehension passages (a prose text followed by questions, or a passage meant for study)
- Screenshots or images of any of the above — the file type (image/PDF/etc.) does NOT matter, only the content
- Subject-matter content such as: scientific theories and experiments, historical events with dates and facts, geographical descriptions of places and landforms, mathematical problems and formulas, English reading passages, comprehension texts, grammar exercises, or literature analysis
- Handwritten academic notes covering any of the five subjects
- The five valid subjects are: History, Geography, Science (Physics/Chemistry/Biology), Mathematics, or English (including comprehension, grammar, and literature)

INVALID documents — reject ALL of the following without exception:
- Class routines, timetables, schedules, or planners — ANY document that shows a time-based schedule (e.g., "Monday: Math 9–10, English 10–11") even if it lists subject names
- Personal plans, career roadmaps, coding plans, 12-week plans, or learning schedules
- Any document that organises or lists WHEN subjects are studied, rather than containing actual subject content
- Programming tutorials, coding guides, DSA study plans, LeetCode problems, software development content
- Computer science or IT content of any kind
- Revision checklists, topic lists, or to-do lists for studying
- Self-improvement, productivity, or motivational content
- Business, legal, medical, or financial documents
- Invoices, receipts, contracts, reports, CVs, cover letters
- Any subject outside the five listed above (no Computer Science, Economics, Psychology, Law, etc.)
- Documents with fewer than 80 words of real subject content

CRITICAL DISTINCTION — ask yourself before deciding:
- Does this document CONTAIN academic subject matter (actual facts, passages, problems, questions)? → ACADEMIC
- Does this document only REFERENCE or ORGANISE subjects (a schedule, timetable, planner, checklist)? → NOT_ACADEMIC
- A timetable listing "Math, English, Science" at different times contains NO subject content and must be rejected, even though it names academic subjects.
- A comprehension passage or textbook page contains actual subject content and must be accepted, even if uploaded as a screenshot.

KEY TEST: "Could a school teacher set exam questions directly from the substance of this text?" If yes → ACADEMIC. If the document is just a schedule, plan, or list of subject names with no actual content → NOT_ACADEMIC.

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
