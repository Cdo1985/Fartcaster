import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, Trophy, Zap, Volume2, Play, Pause, Trash2, Star } from 'lucide-react';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [userTokens, setUserTokens] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [username, setUsername] = useState('');
  const [showUsernameInput, setShowUsernameInput] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const intervalRef = useRef(null);
  const audioRef = useRef(null); 
  const fileInputRef = useRef(null);

  // Initialize Audio and Load data on mount
  useEffect(() => {
    // Only runs in the browser
    audioRef.current = new Audio();
    
    const loadData = () => {
      try {
        const savedRecordings = localStorage.getItem('fartcaster-recordings');
        const savedTokens = localStorage.getItem('fartcaster-tokens');
        const savedUsername = localStorage.getItem('fartcaster-username');

        if (savedRecordings) setRecordings(JSON.parse(savedRecordings));
        if (savedTokens) setUserTokens(parseInt(savedTokens));
        if (savedUsername) {
          setUsername(savedUsername);
          setShowUsernameInput(false);
        }
      } catch (error) {
        console.log('First time user or localStorage blocked');
      }
      setIsLoading(false);
    };

    loadData();

    // The fix for Line 174: Use a local variable for cleanup
    const currentAudio = audioRef.current;

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = "";
      }
    };
  }, []);

  // Handle audio end event
  useEffect(() => {
    const currentAudio = audioRef.current;
    if (currentAudio) {
      currentAudio.onended = () => setPlayingId(null);
    }
  }, [audioRef.current]);

  const saveData = (newRecordings, newTokens) => {
    try {
      localStorage.setItem('fartcaster-recordings', JSON.stringify(newRecordings));
      localStorage.setItem('fartcaster-tokens', newTokens.toString());
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleUsernameSubmit = () => {
    if (username.trim()) {
      setShowUsernameInput(false);
      localStorage.setItem('fartcaster-username', username);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        saveRecording(audioUrl, recordingDuration);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 0.1);
      }, 100);
    } catch (error) {
      alert('Microphone access denied! Vercel requires HTTPS to use the mic.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      const audioUrl = URL.createObjectURL(file);
      const audio = new Audio(audioUrl);
      
      audio.addEventListener('loadedmetadata', () => {
        saveRecording(audioUrl, audio.duration);
      });
    } else {
      alert('Please upload an audio file!');
    }
  };

  const saveRecording = (audioUrl, duration) => {
    const earnedTokens = Math.floor(duration * 15) + Math.floor(Math.random() * 25) + 10;
    
    const newRecording = {
      id: Date.now(),
      user: username,
      audioUrl: audioUrl,
      duration: Number(duration).toFixed(1),
      tokens: earnedTokens,
      timestamp: new Date().toLocaleTimeString(),
      plays: 0,
      rating: (Math.random() * 2 + 3).toFixed(1)
    };
    
    const updatedRecordings = [newRecording, ...recordings].slice(0, 20);
    const updatedTokens = userTokens + earnedTokens;
    
    setRecordings(updatedRecordings);
    setUserTokens(updatedTokens);
    saveData(updatedRecordings, updatedTokens);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const togglePlay = (recording) => {
    if (!audioRef.current) return;

    if (playingId === recording.id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.src = recording.audioUrl;
      audioRef.current.play();
      setPlayingId(recording.id);
      
      const updatedRecordings = recordings.map(r => 
        r.id === recording.id ? { ...r, plays: r.plays + 1 } : r
      );
      setRecordings(updatedRecordings);
      saveData(updatedRecordings, userTokens);
    }
  };

  const deleteRecording = (id) => {
    const updatedRecordings = recordings.filter(r => r.id !== id);
    setRecordings(updatedRecordings);
    saveData(updatedRecordings, userTokens);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">💨 Loading FartCaster...</div>
      </div>
    );
  }

  if (showUsernameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-md w-full">
          <h1 className="text-5xl font-bold mb-4 text-center text-white">💨 FartCaster</h1>
          <p className="text-purple-200 text-center mb-6">Choose your username to start</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUsernameSubmit()}
            placeholder="Enter username..."
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 mb-4"
          />
          <button
            onClick={handleUsernameSubmit}
            disabled={!username.trim()}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 rounded-lg"
          >
            Start Casting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-extrabold mb-2">💨 FARTCASTER</h1>
          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500 text-purple-900 px-6 py-3 rounded-full font-bold text-xl">
            <Zap className="w-6 h-6 fill-purple-900" />
            {userTokens} FART Tokens
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl font-bold mb-4 text-center">Cast Your Fart</h2>
          <div className="flex flex-col items-center gap-6">
            {isRecording && (
              <div className="text-6xl font-mono text-yellow-300 animate-pulse bg-black/20 px-6 py-2 rounded-xl">
                {recordingDuration.toFixed(1)}s
              </div>
            )}
            <div className="flex gap-4">
              {!isRecording ? (
                <>
                  <button onClick={startRecording} className="bg-red-500 rounded-full p-8 hover:scale-110 transition-transform">
                    <Mic className="w-12 h-12" />
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="bg-purple-500 rounded-full p-8 hover:scale-110 transition-transform">
                    <Upload className="w-12 h-12" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                </>
              ) : (
                <button onClick={stopRecording} className="bg-green-500 rounded-full px-12 py-8 text-xl font-bold animate-pulse">
                  STOP & EARN
                </button>
              )}
            </div>
          </div>
        </div>

        {showSuccess && (
          <div className="bg-green-500 text-white rounded-2xl p-4 mb-6 text-center font-bold animate-bounce">
            🎉 Fart successfully cast! 🎉
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Top Casts ({recordings.length})
          </h2>
          {recordings.map((recording) => (
            <div key={recording.id} className="bg-white/10 rounded-2xl p-6 border border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center text-2xl">💨</div>
                <div>
                  <div className="font-bold">{recording.user}</div>
                  <div className="text-purple-300 text-xs">{recording.timestamp}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-yellow-400 font-bold">+{recording.tokens} FART</div>
                <button onClick={() => togglePlay(recording)} className="bg-white/20 rounded-full p-3">
                  {playingId === recording.id ? <Pause /> : <Play />}
                </button>
                <button onClick={() => deleteRecording(recording.id)} className="text-red-400">
                  <Trash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
