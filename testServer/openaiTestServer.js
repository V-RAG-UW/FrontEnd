const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const app = express();
const ffmpeg = require('fluent-ffmpeg');
const { Readable } = require('stream');

app.use(cors());
app.use(express.json());
const port = 5000;

// Set up multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

const openai_key = 'sk-proj-zj06aiN9hZgC1BmLerpWT3BlbkFJG7JWv5sdQR6s1LsnPoki';

app.get('/', (req, res) => {});

app.post('/api/transcribe', upload.single('file'), async (req, res) => {
  const videoFile = req.file;
  if (!videoFile) {
    return res.status(400).send('No video file is uploaded');
  }

  // Check if the file is a WebM
  if (videoFile.mimetype !== 'video/webm') {
    return res.status(400).send('File must be a WebM video');
  }

  const webmBuffer = videoFile.buffer;

  // Convert WebM to WAV in memory
  const wavStream = new Readable();
  wavStream.push(webmBuffer);
  wavStream.push(null);

  try {
    // Convert WebM to WAV using ffmpeg
    const audioData = await new Promise((resolve, reject) => {
      const chunks = [];
      ffmpeg(wavStream)
        .inputFormat('webm')
        .audioCodec('pcm_s16le')
        .outputFormat('wav')
        .on('end', () => {
          console.log('WAV conversion finished');
        })
        .on('error', (err) => {
          console.error('Error during WAV conversion:', err);
          reject('Error during WAV conversion');
        })
        .on('data', (chunk) => {
          chunks.push(chunk);
        })
        .on('end', () => {
          // Combine the audio chunks and resolve the final audio buffer
          resolve(Buffer.concat(chunks));
        })
        .pipe();
    });

    // Send the audio data to the OpenAI Whisper API
    const formData = new FormData();
    formData.append('file', audioData, 'audio.wav');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');

    const config = {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'Authorization': `Bearer ${openai_key}`,
      },
    };

    // Send the audio data to the OpenAI Whisper API
    try {
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, config);
      const transcription = response.data.text;
      console.log('Transcription:', transcription);
      res.json({ transcription });
    } catch (error) {
      console.error('Error transcribing:', error);
      res.status(500).send('Error transcribing the audio');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
