const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

async function extractText(file) {
  const { mimetype, buffer } = file;

  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimetype === 'text/plain') {
    return buffer.toString('utf-8');
  }

  if (['image/jpeg', 'image/png', 'image/webp'].includes(mimetype)) {
    const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
    return text;
  }

  throw new Error(`Unsupported file type: ${mimetype}`);
}

module.exports = { extractText };
