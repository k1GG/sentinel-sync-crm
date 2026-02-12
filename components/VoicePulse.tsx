
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audio';

const VoicePulse: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [stressLevel, setStressLevel] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const startPulse = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            setIsActive(true);
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
          onclose: () => setIsActive(false),
          onerror: (e) => console.error("Pulse Error:", e)
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
      alert("Microphone access denied or API error.");
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
        <h2 className="text-3xl font-bold text-white">Live Sentiment Radar</h2>
        <p className="text-slate-400">Real-time Hinglish acoustic analysis for high-stakes calls.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[60vh]">
        <div className="lg:col-span-8 flex flex-col bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {transcription.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <span className="text-6xl mb-4">🎙️</span>
                <p className="text-sm font-bold uppercase tracking-widest">Ready for analysis</p>
              </div>
            )}
            {transcription.map((t, i) => (
              <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-3xl px-6 py-4 text-sm font-medium ${
                  t.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                }`}>
                  <p className="text-[9px] uppercase font-black opacity-50 mb-1 tracking-tighter">{t.role === 'user' ? 'CLIENT AUDIO' : 'SENTINEL ANALYST'}</p>
                  {t.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-slate-950/50 border-t border-slate-800">
            <button
              onClick={isActive ? stopPulse : startPulse}
              className={`w-full py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 ${
                isActive 
                  ? 'bg-rose-600 text-white shadow-rose-900/40' 
                  : 'bg-indigo-600 text-white shadow-indigo-900/40'
              }`}
            >
              {isActive ? 'Terminate Stream' : 'Initiate Regional Audio Pulse'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-8">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Acoustic Indicators</h4>
            <div className="space-y-8">
              {[
                { label: 'Hinglish Complexity', val: isActive ? 68 : 0, color: 'bg-indigo-500' },
                { label: 'Latency Churn Risk', val: isActive ? 12 : 0, color: 'bg-emerald-500' },
                { label: 'Stress Amplitude', val: isActive ? 45 : 0, color: 'bg-rose-500' }
              ].map((stat, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400">{stat.label}</span>
                    <span className="text-white">{stat.val}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${stat.color} transition-all duration-700`} style={{ width: `${stat.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 rounded-[40px] p-8">
             <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Silent Signal Insight</h4>
             <p className="text-sm text-slate-300 italic leading-relaxed">
               {isActive 
                ? "Monitoring for tonal shifts. Detecting 'Arre Baba' frequency spikes to predict immediate escalation."
                : "Awaiting audio input to generate deep behavioral insights."}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoicePulse;
