import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, Trophy, Zap, Volume2, Play, Pause, Trash2, Star } from 'lucide-react';
import { NeynarContextProvider, NeynarSigninButton, Theme } from "@neynar/react";
import "@neynar/react/dist/style.css";

// --- REPLACE THIS WITH YOUR NEYNAR CLIENT ID ---
const CLIENT_ID = 4b0a10cb-e22d-451e-85f9-427934a34ddc; 

function AppContent() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [userTokens, setUserTokens] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
   
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const intervalRef = useRef(null);
  const audioRef = useRef(null); 
  const fileInputRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio();
    const loadData = () => {
      try {
        const savedRecordings = localStorage.getItem('fartcaster-recordings');
        const savedTokens = localStorage.getItem('fartcaster-tokens');
        const savedUser = localStorage.getItem('fartcaster-user');

        if (savedRecordings) setRecordings(JSON.parse(savedRecordings));
        if (savedTokens) setUserTokens(parseInt(savedTokens));
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch (e) { console.log(e); }
      setIsLoading(false);
    };
    loadData();

    const currentAudio = audioRef.current;
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (currentAudio) { currentAudio.pause(); currentAudio.src = ""; }
    };
  }, []);

  const handleSigninSuccess = (user) => {
    setUser(user);
    localStorage.setItem('fartcaster-user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fartcaster-user');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        saveRecording(URL.createObjectURL(audioBlob), recordingDuration);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      intervalRef.current = setInterval(() => setRecordingDuration(p => p + 0.1), 100);
    } catch (err) { alert('Mic blocked!'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(intervalRef.current);
    }
  };

  const saveRecording = (url, duration) => {
    const earned = Math.floor(duration * 15) + 15;
    const newRec = {
      id: Date.now(),
      user: user?.username || "Anon",
      audioUrl: url,
      duration: duration.toFixed(1),
      tokens: earned,
      timestamp: new Date().toLocaleTimeString(),
      plays: 0,
      rating: (Math.random() * 2 + 3).toFixed(1)
    };
    const updated = [newRec, ...recordings].slice(0, 20);
    setRecordings(updated);
    setUserTokens(prev => prev + earned);
    localStorage.setItem('fartcaster-recordings', JSON.stringify(updated));
    localStorage.setItem('fartcaster-tokens', (userTokens + earned).toString());
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const togglePlay = (rec) => {
    if (playingId === rec.id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.src = rec.audioUrl;
      audioRef.current.play();
      setPlayingId(rec.id);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-purple-900 flex items-center justify-center text-white">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center p-6 text-center">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20">
          <h1 className="text-5xl font-bold text-white mb-6">💨 FartCaster</h1>
          <p className="text-purple-200 mb-8">Sign in with Farcaster to start earning $FART</p>
          <NeynarSigninButton 
            clientId={CLIENT_ID} 
            successCallback={handleSigninSuccess} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
                <img src={user.pfp_url} className="w-10 h-10 rounded-full border-2 border-yellow-400" alt="pfp" />
                <span className="font-bold">@{user.username}</span>
            </div>
            <button onClick={logout} className="text-xs opacity-50 hover:opacity-100 underline">Logout</button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black mb-2">FARTCASTER</h1>
          <div className="inline-flex items-center gap-2 bg-yellow-500 text-purple-900 px-6 py-2 rounded-full font-bold">
            <Zap className="w-5 h-5 fill-purple-900" /> {userTokens} $FART
          </div>
        </div>

        <div className="bg-white/10 rounded-3xl p-8 border border-white/20 mb-8 flex flex-col items-center">
          {isRecording && <div className="text-5xl font-mono text-yellow-300 mb-4 animate-pulse">{recordingDuration.toFixed(1)}s</div>}
          {!isRecording ? (
            <button onClick={startRecording} className="bg-red-500 p-10 rounded-full hover:scale-105 transition-transform">
              <Mic className="w-12 h-12" />
            </button>
          ) : (
            <button onClick={stopRecording} className="bg-green-500 px-10 py-8 rounded-full font-bold text-xl">STOP & CLAIM</button>
          )}
        </div>

        <div className="space-y-4">
          {recordings.map(rec => (
            <div key={rec.id} className="bg-white/10 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <div className="font-bold">@{rec.user}</div>
                <div className="text-xs text-purple-300">{rec.duration}s • {rec.timestamp}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-yellow-400">+{rec.tokens}</div>
                <button onClick={() => togglePlay(rec)} className="bg-white/20 p-3 rounded-full">
                  {playingId === rec.id ? <Pause size={18} /> : <Play size={18} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Wrapper for Neynar Context
export default function App() {
  return (
    <NeynarContextProvider 
      settings={{ 
        clientId: CLIENT_ID, 
        defaultTheme: Theme.Dark,
        eventsCallbacks: { onSigninSuccess: () => {} } 
      }}
    >
      <AppContent />
    </NeynarContextProvider>
  );
}
