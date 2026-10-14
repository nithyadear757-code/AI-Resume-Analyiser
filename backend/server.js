const path = require('node:path');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const { analyzeResume } = require('./utils/analyzer');

dotenv.config();

const app = express();
const allowedExtensions = new Set(['.pdf', '.docx', '.txt']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      callback(new Error('Unsupported file type. Upload a PDF, DOCX, or TXT resume.'));
      return;
    }
    callback(null, true);
  },
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
}));
app.use(express.json({ limit: '20kb' }));

app.get('/', (_request, response) => {
  response.json({ name: 'AI Resume Analyzer API', status: 'ok' });
});

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', analyzer: 'local-keyword-match' });
});

async function extractResumeText(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  if (extension === '.txt') return file.buffer.toString('utf8');
  try {
    if (extension === '.pdf') {
      const parsed = await pdfParse(file.buffer);
      return parsed.text;
    }
    if (extension === '.docx') {
      const parsed = await mammoth.extractRawText({ buffer: file.buffer });
      return parsed.value;
    }
  } catch (error) {
    const parseError = new Error('We could not read that resume. Check that the file is a valid PDF or DOCX.');
    parseError.statusCode = 400;
    parseError.cause = error;
    throw parseError;
  }
  throw new Error('Unsupported file type. Upload a PDF, DOCX, or TXT resume.');
}

app.post('/api/analyze', upload.single('resume'), async (request, response, next) => {
  try {
    if (!request.file) {
      response.status(400).json({ error: 'Upload a PDF, DOCX, or TXT resume.' });
      return;
    }

    const jobDescription = request.body.jobDescription;
    if (typeof jobDescription !== 'string' || jobDescription.trim().length < 40) {
      response.status(400).json({ error: 'The job description must contain at least 40 characters.' });
      return;
    }
    if (jobDescription.length > 12000) {
      response.status(400).json({ error: 'The job description must be no longer than 12,000 characters.' });
      return;
    }

    const resumeText = (await extractResumeText(request.file)).trim();
    if (resumeText.length < 80) {
      response.status(400).json({
        error: 'We could not read enough text from that resume. Try another file or a text-based PDF.',
      });
      return;
    }
    if (resumeText.length > 30000) {
      response.status(400).json({ error: 'The extracted resume text is too long to analyze (maximum 30,000 characters).' });
      return;
    }

    response.json(analyzeResume({
      resumeText,
      jobDescription: jobDescription.trim(),
      fileName: path.basename(request.file.originalname),
    }));
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Your resume must be smaller than 5 MB.'
      : 'Upload one resume file at a time.';
    response.status(400).json({ error: message });
    return;
  }
  if (error.message.startsWith('Unsupported file type')) {
    response.status(400).json({ error: error.message });
    return;
  }
  if (error.message === 'File too large') {
    response.status(400).json({ error: 'Your resume must be smaller than 5 MB.' });
    return;
  }
  if (error.statusCode === 400) {
    response.status(400).json({ error: error.message });
    return;
  }
  console.error('Resume analysis failed:', error);
  response.status(500).json({ error: 'The resume could not be analyzed. Check the file and try again.' });
});

const port = Number(process.env.PORT) || 5000;

if (require.main === module) {
  app.listen(port, '127.0.0.1', () => {
    console.log(`AI Resume Analyzer API listening on http://localhost:${port}`);
  });
}

module.exports = app;
