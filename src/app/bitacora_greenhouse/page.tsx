'use client';

import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import NavBar from '../components/NavBar';

export default function Observaciones() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [selectedUser, setSelectedUser] = useState('William Méndez'); // Usuario seleccionado por defecto
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

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

  const sendData = async () => {
    if (!audioBlob) {
      alert('Please record audio before sending.');
      return;
    }

    setIsSending(true);

    const formData = new FormData();
    formData.append('audio', audioBlob, `recording.${audioBlob.type.includes('webm') ? 'webm' : 'mp4'}`);
    formData.append('user', selectedUser);

    try {
      const response = await fetch( 'https://tok-n8n-sol.onrender.com/webhook/7a896174-14f3-430f-9105-ab53424d18bc',
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

  return (
    <>
      <NavBar />
      <div className="flex justify-center items-center min-h-screen p-6">
        <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg border-4 border-indigo-700">
          <div className="flex justify-center items-center mb-5">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border p-2 rounded-md"
            >
              <option value="Joys Moreno">Joys Moreno</option>
              <option value="Ramiro Ramos">Ramiro Ramos</option>
              <option value="William Méndez">William Méndez</option>
            </select>
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

          <div className="flex justify-center mb-5">
            <button
              onClick={sendData}
              className="bg-blue-500 text-white py-2 px-4 rounded-md"
              disabled={!audioBlob || isSending}
            >
              Enviar Datos
            </button>
          </div>

          <audio
            ref={audioPreviewRef}
            controls
            className={`w-full ${audioBlob ? '' : 'hidden'} mb-5`}
            playsInline
          />
        </div>
      </div>
    </>
  );
}
