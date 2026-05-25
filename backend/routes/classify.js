const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const TECH_BLACKLIST = [
  'leetcode', 'github', ' api ', 'apis', 'backend', 'front-end', 'frontend',
  'framework', 'coding', 'programming', 'software', ' dsa ', 'algorithm',
  'database', ' sql', 'python', 'javascript', 'typescript', 'react', ' node',
  'fastapi', 'sqlite', ' rest ', 'restful', ' jwt ', 'web scraping', 'scraping',
  'hackathon', ' npm ', 'deploy', 'vercel', 'render.com', 'flask', 'django',
  'spring boot', 'docker', 'kubernetes', 'microservice', 'devops', 'ci/cd',
  'machine learning', 'deep learning', 'neural network', 'data science',
];

function blacklistCheck(text) {
  const lower = text.toLowerCase();
  return TECH_BLACKLIST.find((kw) => lower.includes(kw)) || null;
}

router.post('/', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Missing text.' });

  // Step 1 — instant keyword blacklist
  const hit = blacklistCheck(text);
  if (hit) {
    return res.json({
      academic: false,
      reason: `Document contains programming or technology content ("${hit.trim()}") and cannot be used to generate school exam questions.`,
    });
  }

  // Step 2 — AI classification
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
- Personal plans, career roadmaps, coding plans, or any numbered/weekly/12-week learning plans
- Any document that organises or lists WHEN or WHAT to study, rather than containing actual subject content
- Coding plans, programming roadmaps, DSA (data structures & algorithms) study schedules
- Documents that mention LeetCode, GitHub, APIs, programming frameworks (FastAPI, Django, React, etc.), databases (SQLite, PostgreSQL), or software tools
- Programming tutorials, coding guides, software development content, computer science projects
- Computer science or IT content of any kind — including if titled as a "plan", "roadmap", or "curriculum"
- Career development plans, self-improvement plans, or productivity documents — even if structured like a curriculum or week-by-week schedule
- Revision checklists, topic lists, or to-do lists for studying
- Self-improvement, productivity, or motivational content
- Business, legal, medical, or financial documents
- Invoices, receipts, contracts, reports, CVs, cover letters
- Any subject outside the five listed above (no Computer Science, Economics, Psychology, Law, etc.)
- Documents with fewer than 80 words of real subject content

CRITICAL DISTINCTION — ask yourself before deciding:
- Does this document CONTAIN actual school subject matter (facts, passages, problems, questions) from the five valid subjects? → ACADEMIC
- Does this document PLAN, ORGANISE, or DESCRIBE what to learn or build — even in a structured, week-by-week format? → NOT_ACADEMIC
- A coding roadmap or DSA study plan is NOT academic even if it is highly structured and mentions "weeks" or "curriculum".
- A document mentioning LeetCode, GitHub, Python, APIs, or any programming framework is NOT academic — reject it immediately.
- A timetable listing subject names contains no subject content and must be rejected.
- A comprehension passage or textbook page contains actual subject content and must be accepted, even as a screenshot.

KEY TEST: "Does this document teach school subject content (History, Geography, Science, Maths, English) that a teacher could directly set exam questions from?" If the answer is NO for any reason — including because it is a plan, roadmap, coding guide, or schedule — it is NOT_ACADEMIC.

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
