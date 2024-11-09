import React, { useRef, useState, useEffect } from 'react';
import { Button, Card, Container, Col, Row } from 'react-bootstrap';


export default function LLMFront() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const videoStreamRef = useRef(null);
  const videoPreviewRef = useRef(null);

  const [responseText, setResponseText] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  
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
    const MediaRecorder = new MediaRecorder(videoStreamRef.current, {
      mimeType: 'video/webm; codecs=vp9',
    });

    mediaRecorderRef.current = MediaRecorder;
    recordedChunks.current = []; // reset the recorded chunks array
    
    // Push data chunks when data is available during recording
    MediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    // Start the recording
    MediaRecorder.start();
    setIsRecording(true);
  }

  const stopRecording = () => {
    // Stop the recording
    mediaRecorderRef.current.stop();

    // Create a blob from the recorded chunks
    const blob = new Blob(recordedChunks.current, {
      type: 'video/webm',
    });

    sendRecording(blob);

    setIsRecording(false);
    recordedChunks.current = [];
  }

  const sendRecording = async (blob) => {
    const formData = new FormData();
    formData.Homepageend('video', blob, 'sussybaka.webm');

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
              setResponseText(accumulatedText);
            }
          } catch (error) {
            console.error('Error parsing JSON stream chunk', error);
          }
        }
      }
    }

    // Final full response after the stream ends
    console.log('Full LLM response:', accumulatedText);
  };
  
  useEffect(() => {
    if (responseText) {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedText((prev) => prev + responseText[index]);
        index++;
        if (index >= responseText.length) {
          clearInterval(interval);
        }
      }, 50); // Adjust typing speed here
      return () => clearInterval(interval);
    }
  }, [responseText]);

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
    </div>
  </Container>
  )
}