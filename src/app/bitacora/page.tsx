'use client';

import { useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import NavBar from '../components/NavBar';

export default function Observaciones() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const [isSending, setIsSending] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const waveBars = useRef<HTMLDivElement[]>([]);

  const initializeAudioContext = async () => {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        await initializeAudioContext();
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: { ideal: true },
            noiseSuppression: { ideal: true },
            autoGainControl: { ideal: true },
            sampleRate: { ideal: 44100 },
            channelCount: { ideal: 1 },
          },
        });
        startRecording(stream);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Error accessing microphone. Please check your browser settings and try again.');
      }
    } else {
      stopRecording();
    }
  };

  const startRecording = (stream: MediaStream) => {
    setIsRecording(true);

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/mp4';

    const recorder = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: 128000,
    });
    setMediaRecorder(recorder);

    if (audioContextRef.current) {
      try {
        const analyserNode = audioContextRef.current.createAnalyser();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserNode);
        analyserNode.fftSize = 256;
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        setDataArray(dataArray);
        setAnalyser(analyserNode);

        animateWaveform();
      } catch (err) {
        console.error('Error setting up audio analysis:', err);
      }
    }

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      setAudioBlob(blob);
      if (audioPreviewRef.current) {
        const url = URL.createObjectURL(blob);
        audioPreviewRef.current.src = url;
        audioPreviewRef.current.style.display = 'block';
      }
      sendData(blob);
    };

    recorder.start(100);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const animateWaveform = () => {
    if (!analyser || !dataArray) return;

    analyser.getByteFrequencyData(dataArray);
    waveBars.current.forEach((bar, i) => {
      if (bar) {
        const value = dataArray[i * 2];
        const percent = value / 255;
        bar.style.height = `${percent * 100}%`;
      }
    });

    if (isRecording) {
      requestAnimationFrame(animateWaveform);
    }
  };

  const sendData = async (blob: Blob) => {
    if (!blob) {
      alert('Please record audio before sending.');
      return;
    }

    setIsSending(true);

    const formData = new FormData();
    formData.append('audio', blob, `recording.${blob.type.includes('webm') ? 'webm' : 'mp4'}`);

    try {
      const response = await fetch(
        'https://tok-n8n-sol.onrender.com/webhook/ac8c334c-e847-40a9-94e7-aa3a66d93470',
        {
          method: 'POST',
          body: formData,
        }
      );

      const responseText = await response.text();

      if (response.ok) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        alert('Data sent successfully!');
        setAudioBlob(null);
        if (audioPreviewRef.current) {
          audioPreviewRef.current.style.display = 'none';
          audioPreviewRef.current.src = '';
        }
        reloadPage();
      } else {
        throw new Error(`Server responded with status: ${response.status}. Response: ${responseText}`);
      }
    } catch (error) {
      console.error('Failed to send data:', error);
      alert('Failed to send data. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <>
      <NavBar />
      <div className="flex justify-center items-center min-h-screen p-6">
        <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg border-4 border-indigo-700">
          <div className="flex justify-center items-center mb-5">
            <div className="flex space-x-1 h-20">
              {Array.from({ length: 32 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-red-400 to-red-600 transition-all duration-100 ease-linear"
                  style={{ height: '20%' }}
                  ref={(el) => {
                    if (el) waveBars.current[i] = el;
                  }}
                ></div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mb-5">
            <button
              onClick={toggleRecording}
              className={`${isRecording ? 'bg-red-600' : 'bg-green-500'} text-white py-2 px-4 rounded-md`}
              disabled={isSending}
            >
              {isRecording ? '⏹ Stop' : 'Bitacora'}
            </button>
          </div>

          <audio
            ref={audioPreviewRef}
            controls
            className={`w-full ${audioBlob ? '' : 'hidden'} mb-5`}
            playsInline
          />

          <div className="flex justify-center items-center mb-5">
            <div className="text-center">
              <div className="mb-2 text-gray-800">
                Audio Status: {audioBlob ? '✅ Recorded' : '❌ Not recorded'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
