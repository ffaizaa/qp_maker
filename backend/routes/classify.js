const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });


router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text.' });

  const lower = text.toLowerCase();
  const BLACKLIST = ['leetcode', 'github', 'coding', 'programming', 'software', 'dsa', 'algorithm', 'python', 'javascript', 'react', 'fastapi', 'sqlite', 'npm', 'hackathon', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'timetable', 'routine', 'schedule', 'roadmap', 'sprint', 'weekly plan', 'daily plan', 'monthly plan', 'phase 1', 'phase 2', 'week 1', 'week 2'];
  const hit = BLACKLIST.find(kw => lower.includes(kw));
  if (hit) return res.json({ academic: false, reason: `Document rejected: contains "${hit}"` });

  // Step 2 — AI confirmation
  const prompt = `You are a classifier for a school question paper generator.

Decide if the document below is valid academic content for one of these five subjects ONLY:
History, Geography, Science (Physics/Chemistry/Biology), Mathematics, English (literature, comprehension, grammar).

Valid: textbook chapters, exam papers, study notes, comprehension passages, academic articles.
Invalid: timetables, schedules, plans, roadmaps, coding content, CV, business documents, anything outside the five subjects.

Respond with exactly one line:
ACADEMIC: <subject name>
or
NOT_ACADEMIC: <one-line reason>

DOCUMENT:
${text.slice(0, 4000)}`;

  try {
    const raw = (await model.generateContent(prompt)).response.text().trim();

    if (raw.startsWith('ACADEMIC')) {
      const subject = raw.includes(':') ? raw.split(':')[1].trim() : 'Unknown';
      return res.json({ academic: true, subject });
    }

    if (raw.startsWith('NOT_ACADEMIC')) {
      const reason = raw.includes(':') ? raw.split(':').slice(1).join(':').trim() : 'Not a valid academic document.';
      return res.json({ academic: false, reason });
    }

    console.error('Unexpected classifier response:', raw.slice(0, 120));
    return res.json({ academic: false, reason: 'Document validation could not be completed. Please try again.' });

  } catch (err) {
    console.error('Classification error:', err.message);
    return res.json({ academic: false, reason: 'Document validation could not be completed. Please try again.' });
  }
});

module.exports = router;
