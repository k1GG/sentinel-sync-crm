import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audio';

const VoicePulse: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const startPulse = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined") {
      alert("Intelligence engine not authorized. Please link your API key first.");
      return;
    }

    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(s => {
                if (s && typeof s.sendRealtimeInput === 'function') {
                  s.sendRealtimeInput({ media: pcmBlob });
                }
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            setIsActive(true);
            setIsConnecting(false);
          },
          onmessage: async (msg: any) => {
            if (msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
              const audioBytes = decode(msg.serverContent.modelTurn.parts[0].inlineData.data);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(audioBytes, outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              setTranscription(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'model') {
                  return [...prev.slice(0, -1), { role: 'model', text: last.text + text }];
                }
                return [...prev, { role: 'model', text }];
              });
            }

            if (msg.serverContent?.inputTranscription) {
               const text = msg.serverContent.inputTranscription.text;
               setTranscription(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'user') {
                  return [...prev.slice(0, -1), { role: 'user', text: last.text + text }];
                }
                return [...prev, { role: 'user', text }];
              });
            }
          },
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
          },
          onerror: (e) => {
            console.error("Pulse Error:", e);
            setIsConnecting(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "You are the Sentinel Audio Pulse engine. Detect Hinglish stress levels and sentiment velocity. If the user sounds frustrated, highlight 'Critical Risk'. Keep responses very short and analytical.",
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
      alert("Microphone access denied or intelligence node failed to initialize.");
    }
  };

  const stopPulse = () => {
    sessionRef.current?.close();
    setIsActive(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
      <header>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-indigo-500 animate-ping' : 'bg-slate-700'}`}></span>
          <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Regional Audio Pulse</span>
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tighter">Live Sentiment Radar</h2>
        <p className="text-slate-400 font-medium">Real-time Hinglish acoustic analysis for high-stakes calls.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[65vh]">
        <div className="lg:col-span-8 flex flex-col bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl relative">
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {!isActive && !isConnecting && (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                  <span className="text-4xl">🎙️</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">Node Ready for Stream Acquisition</p>
                <p className="text-[10px] text-slate-500 max-w-xs mt-3">Click below to initiate acoustic sentiment velocity analysis.</p>
              </div>
            )}
            
            {isConnecting && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                 <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
                 <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Establishing Neural Link...</p>
              </div>
            )}

            {transcription.map((t, i) => (
              <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[80%] rounded-3xl px-6 py-4 text-sm font-medium ${
                  t.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none shadow-lg' : 'bg-slate-800/80 text-slate-200 rounded-bl-none border border-slate-700'
                }`}>
                  <p className="text-[9px] uppercase font-black opacity-50 mb-1 tracking-widest">{t.role === 'user' ? 'CLIENT STREAM' : 'SENTINEL ANALYST'}</p>
                  {t.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-slate-950/80 border-t border-slate-800">
            <button
              onClick={isActive ? stopPulse : startPulse}
              disabled={isConnecting}
              className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 disabled:opacity-50 ${
                isActive 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 border border-rose-400/20' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40 border border-indigo-400/20'
              }`}
            >
              {isConnecting ? 'Initializing...' : isActive ? 'Terminate Protocol' : 'Initiate Audio Pulse'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8 shadow-xl">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              Neural Indicators
            </h4>
            <div className="space-y-10">
              {[
                { label: 'Hinglish Fluency', val: isActive ? 74 : 0, color: 'bg-indigo-500' },
                { label: 'Churn Frequency', val: isActive ? 18 : 0, color: 'bg-emerald-500' },
                { label: 'Tonal Stress', val: isActive ? 52 : 0, color: 'bg-rose-500' }
              ].map((stat, i) => (
                <div key={stat.label} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-slate-500">{stat.label}</span>
                    <span className="text-white">{stat.val}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${stat.color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.5)]`} style={{ width: `${stat.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 rounded-[40px] p-8 relative overflow-hidden group">
             <div className="absolute -right-6 -top-6 text-7xl opacity-5 group-hover:rotate-12 transition-transform">🛰️</div>
             <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Silent Signal Insight</h4>
             <p className="text-sm text-slate-400 italic leading-relaxed font-medium">
               {isActive 
                ? "Scan active. Analyzing 'Arre Baba' patterns to detect hidden friction points in commercial negotiation."
                : "Awaiting client audio link to activate behavioral forensic engine."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicePulse;
