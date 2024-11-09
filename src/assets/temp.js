const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Set up multer for handling multipart/form-data
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `video_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// Ensure the uploads folder exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Endpoint to handle video upload
app.post('/upload-video', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No video uploaded.');
  }

  console.log('Video uploaded:', req.file.filename);
  res.status(200).send('Video upload successful');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});