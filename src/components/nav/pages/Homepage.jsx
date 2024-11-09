import React, { useRef, useState, useEffect } from 'react';


export default function LLM_Front() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const videoStreamRef = useRef(null);
  
  const llmAPIurl = 'http://localhost:5000';
  
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    videoStreamRef.current = stream;
    const MediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp9',
    });

    mediaRecorderRef.current = MediaRecorder;

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
  

  return <div>
  </div>
}