require('dotenv').config();
const express = require('express');
const cors = require('cors');

const uploadRoute = require('./routes/upload');
const generateRoute = require('./routes/generate');
const classifyRoute = require('./routes/classify');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173'] : '*',
}));
app.use(express.json({ limit: '10mb' }));

app.use('/api/upload', uploadRoute);
app.use('/api/generate', generateRoute);
app.use('/api/classify', classifyRoute);

// JSON error handler — catches anything Express 5 forwards via next(err)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const server = app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

// Scanned PDFs go through Gemini File API which can take 30–60s
server.setTimeout(120000);
