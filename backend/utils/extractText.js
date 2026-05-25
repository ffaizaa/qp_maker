const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const visionModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const VISION_PROMPT =
  'Extract ALL text from this document exactly as it appears. ' +
  'Include printed text, handwritten text, mathematical expressions, tables, and any other visible content. ' +
  'Preserve the original structure and order across all pages. Return only the extracted text — no commentary or explanation.';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Poll until file is no longer PROCESSING
async function waitForFile(file) {
  let f = file;
  while (f.state === 'PROCESSING') {
    await sleep(2000);
    f = await fileManager.getFile(f.name);
  }
  if (f.state === 'FAILED') throw new Error('Gemini file processing failed.');
  return f;
}

// Retry a Gemini call up to maxAttempts times on transient errors
async function withRetry(fn, maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (err) {
      const transient = err.message?.includes('503') || err.message?.includes('429') || err.message?.includes('overloaded');
      if (!transient || i === maxAttempts - 1) throw err;
      console.log(`Gemini transient error (attempt ${i + 1}): ${err.message} — retrying in ${(i + 1) * 3}s`);
      await sleep((i + 1) * 3000);
    }
  }
}

// Gemini File API — reliable for multi-page scanned PDFs and large images
async function extractWithFileAPI(buffer, mimetype, filename) {
  const tmpPath = path.join(os.tmpdir(), `qpmaker-${Date.now()}-${filename}`);
  fs.writeFileSync(tmpPath, buffer);

  let uploadedFileName = null;
  try {
    const uploadResult = await fileManager.uploadFile(tmpPath, {
      mimeType: mimetype,
      displayName: filename,
    });

    const file = await waitForFile(uploadResult.file);
    uploadedFileName = file.name;

    const text = await withRetry(() =>
      visionModel.generateContent([
        { fileData: { mimeType: file.mimeType, fileUri: file.uri } },
        VISION_PROMPT,
      ]).then((r) => r.response.text().trim())
    );

    return text;
  } finally {
    fs.unlinkSync(tmpPath);
    if (uploadedFileName) {
      try { await fileManager.deleteFile(uploadedFileName); } catch (_) {}
    }
  }
}

// Inline base64 — for small single images only
async function extractWithInlineVision(buffer, mimetype) {
  return await withRetry(() =>
    visionModel.generateContent([
      { inlineData: { mimeType: mimetype, data: buffer.toString('base64') } },
      VISION_PROMPT,
    ]).then((r) => r.response.text().trim())
  );
}

async function extractText(file) {
  const { mimetype, buffer, originalname } = file;

  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    const text = data.text?.trim() ?? '';

    if (text.length < 100) {
      console.log('PDF appears scanned/image-based — using Gemini Vision via File API');
      return await extractWithFileAPI(buffer, 'application/pdf', originalname || 'document.pdf');
    }

    return text;
  }

  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimetype === 'text/plain') {
    return buffer.toString('utf-8');
  }

  if (['image/jpeg', 'image/png', 'image/webp'].includes(mimetype)) {
    try {
      const text = await extractWithInlineVision(buffer, mimetype);
      if (text.length > 0) return text;
    } catch (err) {
      console.error('Gemini Vision failed for image, falling back to Tesseract:', err.message);
    }
    const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
    return text;
  }

  throw new Error(`Unsupported file type: ${mimetype}`);
}

module.exports = { extractText };
