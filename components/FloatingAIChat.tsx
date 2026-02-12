
import React, { useState, useRef, useEffect } from 'react';
import { generateSupportResponse } from '../services/geminiService';
import { Client } from '../types';

interface FloatingAIChatProps {
  activeClient?: Client;
}

const FloatingAIChat: React.FC<FloatingAIChatProps> = ({ activeClient }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Namaste! I am the Sentinel Support AI. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInputValue('');
    setIsTyping(true);

    const contextStr = activeClient 
      ? `Active Client context: Name: ${activeClient.name}, Company: ${activeClient.company}, Health: ${activeClient.healthScore}%, Risk: ${activeClient.riskLevel}, Industry: ${activeClient.industry}, MRR: ₹${activeClient.mrr}.`
      : "No client currently focused.";

    try {
      const response = await generateSupportResponse(messages, userText, contextStr);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to Sentinel Intel. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed z-[100] transition-all duration-300 ${
      isOpen 
        ? 'inset-0 md:inset-auto md:bottom-6 md:left-6' 
        : 'bottom-24 md:bottom-6 left-4 md:left-6'
    }`}>
      {isOpen && (
        <div className="w-full h-full md:w-80 lg:w-96 md:h-[500px] bg-slate-900 md:border md:border-slate-700 md:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300 overflow-hidden md:backdrop-blur-xl">
          <div className="p-4 bg-blue-600 flex items-center justify-between shadow-lg safe-top">
            <div className="flex flex-col">
               <h3 className="text-xs font-bold text-white uppercase tracking-widest">Support AI</h3>
               {activeClient && (
                 <span className="text-[8px] text-blue-100 font-bold uppercase opacity-80">Focus: {activeClient.company}</span>
               )}
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-[11px] leading-relaxed shadow-md ${
                  m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800/50 rounded-full px-3 py-1 flex space-x-1 items-center">
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 pb-safe bg-slate-950/40 border-t border-slate-800">
            <div className="relative">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm md:text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-blue-500 pr-12"
              />
              <button 
                type="submit" 
                disabled={isTyping || !inputValue.trim()}
                className="absolute right-2 top-1.5 p-2 text-blue-500 disabled:opacity-30 transition-transform active:scale-90"
              >
                ✈
              </button>
            </div>
          </form>
        </div>
      )}

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-600 flex items-center justify-center transition-all duration-300 shadow-2xl shadow-blue-500/30 hover:scale-110 active:scale-95 border border-white/10 group"
        >
          <div className="relative">
             <span className="text-2xl md:text-3xl">💬</span>
             <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
          </div>
          <span className="absolute left-full ml-4 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block uppercase tracking-widest">
            Support AI
          </span>
        </button>
      )}
    </div>
  );
};

export default FloatingAIChat;
