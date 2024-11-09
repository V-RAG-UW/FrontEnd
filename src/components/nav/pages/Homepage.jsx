import React, { useRef, useState, useEffect } from 'react';
import { Button, Card } from 'react-bootstrap';


export default function LLM_Front(props) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const videoStreamRef = useRef(null);
  const videoPreviewRef = useRef(null);
  
  const llmAPIurl = 'http://localhost:5000';
  
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    videoStreamRef.current = stream;
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = stream;
    }

    const MediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp9',
    });

    mediaRecorderRef.current = MediaRecorder;
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
  }

  const stopRecording = () => {
    // Stop the recording
    mediaRecorderRef.current.stop();
    videoStreamRef.current.getTracks().forEach((track) => track.stop());
    
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
      });

      if (response.ok) {
        console.log('Recording uploaded successfully');
      } else {
        console.error(`Failed to upload recording: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to upload recording', error);
    }
  }
  
  useEffect(() => {
    const startWebcamPreview = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false, // Only video for the preview
      });

      videoStreamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    };

    startWebcamPreview();

    // Cleanup on unmount
    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
  <div className="container">
    <h1 className="my-4">Webcam and Microphone Recorder</h1>

    <Card style={{ width: '100%', maxWidth: '640px', margin: 'auto' }}>
      <Card.Body>
        <Card.Title>Webcam Preview</Card.Title>
        <Card.Img
          as="video"
          ref={videoPreviewRef}
          autoPlay
          muted
          style={{ width: '100%' }}
        />
      </Card.Body>
    </Card>

    <div className="my-4">
      {!isRecording ? (
        <Button variant="primary" onClick={startRecording}>Start Recording</Button>
      ) : (
        <Button variant="danger" onClick={stopRecording}>Stop Recording</Button>
      )}
    </div>
  </div>
  )
}