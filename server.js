const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const uploadsDir = path.join(rootDir, 'uploads');
const dataDir = path.join(rootDir, 'data');
const notesFile = path.join(dataDir, 'notes.json');

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function loadNotes() {
  if (!fs.existsSync(notesFile)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(notesFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveNotes(notes) {
  fs.writeFileSync(notesFile, JSON.stringify(notes, null, 2));
}

ensureDirectory(uploadsDir);
ensureDirectory(dataDir);

app.use(cors());
app.use(express.json());
app.use(express.static(rootDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subjectId = req.body.subjectId || 'general';
    const subjectDir = path.join(uploadsDir, subjectId);
    ensureDirectory(subjectDir);
    cb(null, subjectDir);
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, safeName);
  }
});

const upload = multer({ storage });

app.get('/api/notes', (req, res) => {
  const subjectId = req.query.subjectId;
  const notes = loadNotes();

  const filtered = subjectId
    ? notes.filter((note) => note.subjectId === subjectId)
    : notes;

  res.json(filtered.sort((a, b) => b.uploadedAt - a.uploadedAt));
});

app.post('/api/notes', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { subjectId, uploader = '' } = req.body;
  const note = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    subjectId,
    name: req.file.originalname,
    size: req.file.size,
    type: req.file.mimetype || 'application/octet-stream',
    uploader,
    uploadedAt: Date.now(),
    filePath: path.relative(rootDir, req.file.path).replace(/\\/g, '/'),
  };

  const notes = loadNotes();
  notes.unshift(note);
  saveNotes(notes);

  res.status(201).json(note);
});

app.get('/api/download/:id', (req, res) => {
  const notes = loadNotes();
  const note = notes.find((item) => item.id === req.params.id);

  if (!note || !note.filePath) {
    return res.status(404).json({ error: 'File not found' });
  }

  const filePath = path.join(rootDir, note.filePath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File missing on server' });
  }

  res.download(filePath, note.name);
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GNOSIS backend running at http://localhost:${PORT}`);
});
