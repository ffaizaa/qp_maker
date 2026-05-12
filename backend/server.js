require('dotenv').config();
const express = require('express');
const cors = require('cors');

const uploadRoute = require('./routes/upload');
const generateRoute = require('./routes/generate');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/upload', uploadRoute);
app.use('/api/generate', generateRoute);

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
