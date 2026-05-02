const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer');
const { extractText } = require('../utils/extractText');

router.post('/', upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const text = await extractText(req.file);

    if (!text || text.trim().length === 0) {
      return res.status(422).json({ error: 'Could not extract any text from the uploaded file.' });
    }

    res.json({ text: text.trim() });
  } catch (err) {
    console.error('Text extraction error:', err);
    res.status(500).json({ error: err.message || 'Failed to extract text from file.' });
  }
});

module.exports = router;
