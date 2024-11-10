const visualizeAudio = (audio) => {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }

  const audioContext = audioContextRef.current;
  const source = audioContext.createMediaElementSource(audio);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  source.connect(analyser);
  analyser.connect(audioContext.destination);

  analyserRef.current = analyser;

  const canvas = canvasRef.current;
  const canvasContext = canvas.getContext('2d');
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const drawCircularVisualization = () => {
    analyser.getByteFrequencyData(dataArray);
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    const radius = canvas.height / 2.5;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const barWidth = (2 * Math.PI) / bufferLength;
    const maxBarHeight = radius - 10;
    
    for (let i = 0; i < bufferLength; i++) {
      const frequency = (i / bufferLength) * audioContext.sampleRate;
      if (frequency > 85 || frequency < 255) {
        const barHeight = dataArray[i] / 2; // Scale the bar height
        const angle = i * barWidth;
  
        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + 1 + (barHeight * maxBarHeight / 255));
        const y2 = centerY + Math.sin(angle) * (radius + 1 + (barHeight * maxBarHeight / 255));
  
        // Draw circular bar
        canvasContext.beginPath();
        canvasContext.moveTo(x1, y1);
        canvasContext.lineTo(x2, y2);
        canvasContext.strokeStyle = `hsl(${i * 360 / bufferLength}, 100%, 50%)`;
        canvasContext.lineWidth = 2;
        canvasContext.stroke();
      }
    }

    requestAnimationFrame(drawCircularVisualization);
  };

  drawCircularVisualization();
};

const drawInitialCanvas = () => {
  const canvas = canvasRef.current;
  const canvasContext = canvas.getContext('2d');

  const radius = canvas.height / 2.5;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const barWidth = (2 * Math.PI) / 128;

  for (let i = 0; i < 256; i++) {
    const angle = i * barWidth;
  
    const x1 = centerX + Math.cos(angle) * radius;
    const y1 = centerY + Math.sin(angle) * radius;
    const x2 = centerX + Math.cos(angle) * (radius + 1);
    const y2 = centerY + Math.sin(angle) * (radius + 1);

    canvasContext.beginPath();
    canvasContext.moveTo(x1, y1);
    canvasContext.lineTo(x2, y2);
    canvasContext.strokeStyle = `hsl(${i * 360 / 128}, 100%, 50%)`;
    canvasContext.lineWidth = 2;
    canvasContext.stroke();
  }
};


<div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '105px' }}>
<canvas ref={canvasRef} style={{ width: '420px', height: '200px', maxWidth: '100%', maxHeight: '100%' }} />
</div>