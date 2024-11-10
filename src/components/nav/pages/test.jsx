import React, { useRef, useState, useEffect } from 'react';
import { Button, Card, Container, Col, Row } from 'react-bootstrap';

export default function LLMFront() {
  const isDevMode = true; // Set to true if running in dev mode
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const videoStreamRef = useRef(null);
  const videoPreviewRef = useRef(null);

  // LLM Text Response stuff
  const [responseText, setResponseText] = useState('');
  const [displayedText, setDisplayedText] = useState('');

  // TTS stuff
  const elevenLabsAPIKey = "sk_0498c804c30683cedaf5fd1f6c1e63de649af08e5b2ee6dc";
  const elevenLabsVoiceID = "cgSgspJ2msm6clMCkdW9";
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  
  const llmAPIurl = 'http://localhost:5000';
    
  useEffect(() => {
    const startWebcam = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      videoStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    };

    startWebcam();

    // Cleanup on unmount
    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    const mediaRecorder = new MediaRecorder(videoStreamRef.current, {
      mimeType: 'video/webm',
    });

    mediaRecorderRef.current = mediaRecorder;
    recordedChunks.current = []; // reset the recorded chunks array
    
    // Push data chunks when data is available during recording
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    // Start the recording
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    // Stop the recording
    mediaRecorderRef.current.stop();

    mediaRecorderRef.current.onstop = () => {
      // Create a blob from the recorded chunks
      const blob = new Blob(recordedChunks.current, {
        type: 'video/mp4; codecs=avc1.42E01E, mp4a.40.2',
      });
  
      if (isDevMode) {
        // Create a URL for the blob
        const videoURL = URL.createObjectURL(blob);
        
        // Create a link to download the video
        const link = document.createElement('a');
        link.href = videoURL;
        link.download = 'cbt.mp4';
        link.click();  // Trigger the download
      }

      // Send data to LLM
      // sendRecording(blob);
    };

    setIsRecording(false);
    recordedChunks.current = [];
  };

  const sendRecording = async (blob) => {
    const formData = new FormData();
    formData.append('video', blob, 'sussybaka.mp4');

    try {
      const response = await fetch(`${llmAPIurl}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        // Handle response stream from LLM
        handleResponseStream(response.body);
      } else {
        console.error(`Failed to upload recording: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to upload recording', error);
    }
  };

  // Handle streaming response
  const handleResponseStream = async (responseBody) => {
    const reader = responseBody.getReader();
    const decoder = new TextDecoder('utf-8');

    let result;
    let accumulatedText = ''; // To accumulate the full response
    setDisplayedText(''); // Clear previous displayed text
    while (!(result = await reader.read()).done) {
      const chunk = decoder.decode(result.value, { stream: true });

      // The response often comes in `data: ` chunks
      const lines = chunk.split('\n');
      for (let line of lines) {
        if (line.startsWith('data:')) {
          line = line.replace(/^data: /, '');

          if (line === '[DONE]') {
            // Stream has finished
            console.log('Stream completed');
            break;
          }

          try {
            const parsedLine = JSON.parse(line);
            const delta = parsedLine.choices[0].delta.content;
            if (delta) {
              accumulatedText += delta; // Append delta to the full response
            }
          } catch (error) {
            console.error('Error parsing JSON stream chunk', error);
          }
        }
      }
    }

    // Final full response after the stream ends
    console.log('Full LLM response:', accumulatedText);
    setResponseText(accumulatedText);
  };

  useEffect(() => {
    if (responseText) {
      console.log('Received response:', responseText);
      ElevenLabsTTS(responseText);
    }
  }, [responseText]);

  const ElevenLabsTTS = async (text) => {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceID}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenLabsAPIKey,
        },
        body: JSON.stringify({text: text}),
      });
  
      if (!response.ok) {
        throw new Error('Error generating speech');
      }
  
      const mediaSource = new MediaSource();
        const audio = new Audio();
        audio.src = URL.createObjectURL(mediaSource);

      mediaSource.addEventListener('sourceopen', () => {
        const sourceBuffer = mediaSource.addSourceBuffer('audio/webm; codecs=opus');

        // Stream the audio chunks as they come in
        const reader = response.body.getReader();

        let index = 0;
        let accumulatedText = '';  // To accumulate the displayed text

        const readChunk = async () => {
          const { done, value } = await reader.read();
          if (done) {
            mediaSource.endOfStream();  // Mark the stream as finished
            return;
          }

          // Append the audio chunk to the sourceBuffer
          sourceBuffer.appendBuffer(value);

          // Sync the typing effect with the audio duration of the chunk
          const chunkDuration = value.byteLength / (sourceBuffer.timestampOffset * text.split('').length);
          accumulatedText += text.split('')[index];
          setDisplayedText(accumulatedText);
          index++;

          setTimeout(() => {
            readChunk();  // Read the next chunk after typing the current chunk
          }, chunkDuration * 1000);  // Set typing speed based on chunk duration
        };

        readChunk();  // Start reading chunks
      });

      audio.play();  // Play the audio
      typeText();  // Start typing the text
    } catch (error) {
      console.error('Error generating speech with ElevenLabs:', error);
    }
  };
  
  const typeText = () => {
  
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + responseText.split('')[index]);
      index++;
      if (index >= responseText.length) {
        clearInterval(interval);
      }
    }, 250); // Typing interval is based on speech duration
  };

  return (
  <Container className="text-center my-5">
    <Row>
      <Col md={6}>
        <Card style={{ width: '100%', margin: 'auto', height: '100%' }}>
          <Card.Body>
            <Card.Title>LLM Response</Card.Title>
            <Card.Text style={{ whiteSpace: 'pre-wrap', minHeight: '200px' }}>
              {displayedText || 'Awaiting response...'}
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col md={6}>
        <Card style={{ width: '100%', maxWidth: '640px', margin: 'auto' }}>
          <Card.Body>
            <Card.Title>You</Card.Title>
            <Card.Img
              as="video"
              ref={videoPreviewRef}
              autoPlay
              muted
              style={{ width: '100%', transform: 'scaleX(-1)' }}
            />
          </Card.Body>
        </Card>
      </Col>
    </Row>

    <div className="my-4">
      {!isRecording ? (
        <Button variant="primary" onClick={startRecording}>Start Conversation</Button>
      ) : (
        <Button variant="danger" onClick={stopRecording}>Stop Conversation</Button>
      )}
      <Button style={{ marginLeft: '10px' }} variant="primary" onClick={() => setResponseText('Hello World')}>Test Button</Button>
    </div>
  </Container>
  )
}

const visualizeAudio = (audio) => {
  const analyser = analyserRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const draw = () => {
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    const radius = 100;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < bufferLength; i++) {
      const value = dataArray[i];
      const angle = (i / bufferLength) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      const r = Math.max(50, value);

      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    requestAnimationFrame(draw);
  };

  draw();
};