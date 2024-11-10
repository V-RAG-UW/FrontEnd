import React, { useRef, useState, useEffect } from 'react';
import { Button, Card, Container, Col, Row } from 'react-bootstrap';

export default function LLMFront() {
  const isDebugMode = false; // Set to true if running in dev mode
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
  const elevenLabsURL = `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceID}/stream`;
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

    // clear the previous response
    setResponseText(null);

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
  
      if (isDebugMode) {
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
    setResponseText(null); // Clear previous response text
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
            if (delta && delta.length > 0) {
              accumulatedText += delta; // Append delta to the full response
              console.log('LLM response:', delta);
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
    } else {
      setDisplayedText('Awaiting response...');
    }
  }, [responseText]);

  const ElevenLabsTTS = async (text) => {
    // Fetch audio stream from ElevenLabs API
    const options =
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": elevenLabsAPIKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          similarity_boost: 0.8,
          stability: 0.3
        },
      }),
    }

    try {
      const response = await fetch(elevenLabsURL, options);
      const audiofile = await response.blob();
      
      // play the audio file
      const audioUrl = URL.createObjectURL(audiofile);
      const audio = new Audio(audioUrl);
      audio.play();

      audio.addEventListener('loadedmetadata', () => {
        // Typing effect by taking duration of the audio file divided by the number of characters
        const typingInterval = audio.duration / text.length;
        typeText(typingInterval, text);
      });

      if (isDebugMode) {
        // save the audio file
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = 'llm_response.wav';
        a.click();
      }

    } catch (error) {
      console.error("Error generating speech with ElevenLabs:", error);
    }
  };

  const typeText = (typingInterval, text) => {
    let index = 0;
    setDisplayedText(''); // Clear previous displayed text
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.split('')[index-1]);
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, typingInterval * 500); // Typing interval is based on speech duration
  };

  // Function to simulate receiving a stream of data from the LLM
  const simulateLLMStream = () => {
    const simulatedChunks = [
      { delta: "This is the first chunk. " },
      { delta: "And this is the second chunk. " },
      { delta: "Finally, we have the third chunk of data." }
    ];

    const simulatedStream = new ReadableStream({
      start(controller) {
        simulatedChunks.forEach((chunk, index) => {
          setTimeout(() => {
            const jsonChunk = JSON.stringify({ choices: [{ delta: { content: chunk.delta } }] });
            const chunkData = `data: ${jsonChunk}\n\n`;
            controller.enqueue(new TextEncoder().encode(chunkData)); // Send the data in chunks

            if (index === simulatedChunks.length - 1) {
              setTimeout(() => {
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n')); // End of the stream
                controller.close(); // Close the stream after sending all chunks
              }, 1000);
            }
          }, index * 1000); // Simulate a delay between chunks (1 second per chunk)
        });
      }
    });

    // Pass the entire stream to the handleResponseStream function
    handleResponseStream(simulatedStream);
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
      
      {isDebugMode && (
        <>
          <Button style={{ marginLeft: '10px' }} variant="primary" onClick={() => {setResponseText('This is a longer string of words')}}>Test Button</Button>
          <Button style={{ marginLeft: '10px' }} variant="primary" onClick={() => {setResponseText(null)}}>Clear Button</Button>
          <Button style={{ marginLeft: '10px' }} variant="primary" onClick={simulateLLMStream}>Simulate Stream</Button>
        </>
      )}
    </div>
  </Container>
  )
}