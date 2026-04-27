const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const LectureNote = require('../models/LectureNote');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
  fileFilter: (req, file, cb) => {
    // Allow documents and images
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|ppt|pptx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('File type not allowed for lecture notes'));
  }
});

// Upload a note
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, module } = req.body;
    
    if (!title || !module) {
      return res.status(400).json({ error: 'Title and Module are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const newNote = new LectureNote({
      title,
      module,
      fileUrl
    });

    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error uploading lecture note:', error);
    res.status(500).json({ error: 'Failed to upload lecture note' });
  }
});

// Get all notes
router.get('/', async (req, res) => {
  try {
    const { module } = req.query;
    let query = {};
    if (module) {
      query.module = module;
    }
    const notes = await LectureNote.find(query).sort({ uploadedAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching lecture notes:', error);
    res.status(500).json({ error: 'Failed to fetch lecture notes' });
  }
});

module.exports = router;
