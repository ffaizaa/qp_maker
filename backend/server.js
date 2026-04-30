require('dotenv').config();
const express = require('express');
const cors = require('cors');

const uploadRoute = require('./routes/upload');
const generateRoute = require('./routes/generate');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/upload', uploadRoute);
app.use('/api/generate', generateRoute);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
