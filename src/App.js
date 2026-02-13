import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, Trophy, Zap, Volume2, Play, Pause, Trash2, Star } from 'lucide-react';

export default function FartCaster() {
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
  const audioRef = useRef(new Audio());
  const fileInputRef = useRef(null);

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [recordingsResult, tokensResult, usernameResult] = await Promise.all([
        window.storage.get('fartcaster-recordings'),
        window.storage.get('fartcaster-tokens'),
        window.storage.get('fartcaster-username')
      ]);

      if (recordingsResult?.value) {
        setRecordings(JSON.parse(recordingsResult.value));
      }
      if (tokensResult?.value) {
        setUserTokens(parseInt(tokensResult.value));
      }
      if (usernameResult?.value) {
        setUsername(usernameResult.value);
        setShowUsernameInput(false);
      }
    } catch (error) {
      console.log('First time user, no data to load');
    }
    setIsLoading(false);
  };

  const saveData = async (newRecordings, newTokens) => {
    try {
      await Promise.all([
        window.storage.set('fartcaster-recordings', JSON.stringify(newRecordings)),
        window.storage.set('fartcaster-tokens', newTokens.toString())
      ]);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const saveUsername = async (name) => {
    try {
      await window.storage.set('fartcaster-username', name);
    } catch (error) {
      console.error('Error saving username:', error);
    }
  };

  const handleUsernameSubmit = () => {
    if (username.trim()) {
      setShowUsernameInput(false);
      saveUsername(username);
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
      alert('Microphone access denied! Please enable microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
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
      duration: duration.toFixed(1),
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
    if (playingId === recording.id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.src = recording.audioUrl;
      audioRef.current.play();
      setPlayingId(recording.id);
      
      // Increment plays
      const updatedRecordings = recordings.map(r => 
        r.id === recording.id ? { ...r, plays: r.plays + 1 } : r
      );
      setRecordings(updatedRecordings);
      saveData(updatedRecordings, userTokens);
    }
  };

  const deleteRecording = async (id) => {
    const updatedRecordings = recordings.filter(r => r.id !== id);
    setRecordings(updatedRecordings);
    await saveData(updatedRecordings, userTokens);
  };

  useEffect(() => {
    audioRef.current.onended = () => setPlayingId(null);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      audioRef.current.pause();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading FartCaster...</div>
      </div>
    );
  }

  if (showUsernameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center p-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 max-w-md w-full">
          <h1 className="text-5xl font-bold mb-4 text-center text-white">💨 FartCaster</h1>
          <p className="text-purple-200 text-center mb-6">Choose your username to start casting</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
            placeholder="Enter username..."
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-300 border border-white/30 mb-4 text-lg"
            autoFocus
          />
          <button
            onClick={handleUsernameSubmit}
            disabled={!username.trim()}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white font-bold py-3 rounded-lg transition-all"
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2">💨 FartCaster</h1>
          <p className="text-purple-200 text-lg mb-2">Decentralized Flatulence Protocol</p>
          <p className="text-purple-300 text-sm mb-4">Welcome, {username}!</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500 text-purple-900 px-6 py-3 rounded-full font-bold text-xl shadow-lg">
            <Zap className="w-6 h-6" />
            {userTokens} FART Tokens
          </div>
        </div>

        {/* Recording Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
          <h2 className="text-2xl font-bold mb-4 text-center">Cast Your Fart</h2>
          
          <div className="flex flex-col items-center gap-6">
            {isRecording && (
              <div className="text-6xl font-mono text-yellow-300 animate-pulse">
                {recordingDuration.toFixed(1)}s
              </div>
            )}
            
            <div className="flex gap-4">
              {!isRecording ? (
                <>
                  <button
                    onClick={startRecording}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full p-8 transition-all transform hover:scale-110 shadow-2xl hover:shadow-red-500/50"
                  >
                    <Mic className="w-12 h-12" />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-purple-500 hover:bg-purple-600 text-white rounded-full p-8 transition-all transform hover:scale-110 shadow-2xl hover:shadow-purple-500/50"
                  >
                    <Upload className="w-12 h-12" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </>
              ) : (
                <button
                  onClick={stopRecording}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full px-12 py-8 text-xl font-bold transition-all transform hover:scale-110 shadow-2xl animate-pulse"
                >
                  Stop & Earn Tokens
                </button>
              )}
            </div>
            
            <p className="text-purple-200 text-sm text-center">
              {isRecording ? "🎤 Recording... Let it rip! 💨" : "🎙️ Record live or 📤 upload your finest work"}
            </p>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-500 text-white rounded-2xl p-4 mb-6 text-center font-bold animate-bounce shadow-lg">
            🎉 Fart successfully cast! Tokens earned! 🎉
          </div>
        )}

        {/* Feed */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Your Casts ({recordings.length})
          </h2>
          
          {recordings.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-12 border border-white/10 text-center text-purple-300">
              <p className="text-xl mb-2">No casts yet!</p>
              <p>Record or upload your first fart to earn tokens 💨</p>
            </div>
          ) : (
            recordings.map((recording) => (
              <div
                key={recording.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-lg">
                      💨
                    </div>
                    <div>
                      <div className="font-bold text-lg">{recording.user}</div>
                      <div className="text-purple-200 text-sm">{recording.timestamp}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => togglePlay(recording)}
                      className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all transform hover:scale-110"
                    >
                      {playingId === recording.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteRecording(recording.id)}
                      className="bg-red-500/20 hover:bg-red-500/40 rounded-full p-3 transition-all transform hover:scale-110"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-purple-200">
                      <Volume2 className="w-4 h-4" />
                      {recording.plays} plays
                    </div>
                    <div className="flex items-center gap-1 text-yellow-300">
                      <Star className="w-4 h-4 fill-yellow-300" />
                      {recording.rating}/5
                    </div>
                    <div className="text-purple-300">
                      {recording.duration}s
                    </div>
                  </div>
                  <div className="text-yellow-300 font-bold text-lg">
                    +{recording.tokens} FART
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-purple-300 text-sm space-y-2">
          <p>🔗 Powered by the Ethereum Flatulence Network</p>
          <p>⚠️ FART tokens stored locally... for now 💎</p>
          <button
            onClick={() => {
              setShowUsernameInput(true);
              setUsername('');
            }}
            className="text-purple-400 hover:text-purple-200 underline"
          >
            Change Username
          </button>
        </div>
      </div>
    </div>
  );
}
