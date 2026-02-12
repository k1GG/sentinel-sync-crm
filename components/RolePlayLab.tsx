
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Client } from '../types';
import { generateRolePlayResponse } from '../services/geminiService';

interface RolePlayLabProps {
  clients: Client[];
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
}

const RolePlayLab: React.FC<RolePlayLabProps> = ({ clients, selectedClientId, setSelectedClientId }) => {
  const selectedClient = useMemo(() => 
    clients.find(c => c.id === selectedClientId) || clients[0],
    [clients, selectedClientId]
  );

  const [messages, setMessages] = useState<{ role: 'user' | 'twin', content: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedClient) return;

    const userMsg = inputValue;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInputValue('');
    setIsTyping(true);

    const clientContext = `${selectedClient.name} from ${selectedClient.company}. Status: ${selectedClient.riskLevel}. Hinglish speaker.`;
    
    try {
      const response = await generateRolePlayResponse(clientContext, userMsg);
      setMessages(prev => [...prev, { role: 'twin', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'twin', content: "Mafi chahta hoon, connection issue." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-160px)] md:h-[calc(100vh-120px)] gap-4 md:gap-6">
      {/* Selector - Scrolled on desktop, flat on mobile select */}
      <div className="lg:w-80 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden h-48 lg:h-auto">
        <div className="p-4 border-b border-slate-800 bg-slate-800/30">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Digital Twins</h3>
        </div>
        <div className="flex-1 overflow-x-auto lg:overflow-y-auto p-2 flex lg:flex-col gap-2">
          {clients.map((client) => (
            <button
              key={client.id}
              onClick={() => {
                setSelectedClientId(client.id);
                setMessages([]);
              }}
              className={`flex-shrink-0 lg:flex-shrink-1 w-48 lg:w-full p-3 rounded-xl text-left transition-all border ${
                selectedClient?.id === client.id ? 'bg-blue-600/10 border-blue-500/30' : 'bg-slate-900 border-transparent hover:bg-slate-800'
              }`}
            >
              <p className={`text-sm font-bold truncate ${selectedClient?.id === client.id ? 'text-blue-400' : 'text-slate-300'}`}>
                {client.name}
              </p>
              <p className="text-[10px] text-slate-500 uppercase font-bold truncate tracking-wider">{client.company}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Simulation Area */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col overflow-hidden relative shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {selectedClient?.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{selectedClient?.name} Clone</p>
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                Active
              </p>
            </div>
          </div>
          <button onClick={() => setMessages([])} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest">Reset</button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-4">
              <div className="text-4xl">🗨️</div>
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">Negotiation Training</h4>
              <p className="text-xs text-slate-500 max-w-[240px]">Test your skills against {selectedClient?.name}'s digital personality.</p>
            </div>
          )}
          
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-lg ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50'
              }`}>
                {m.content}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-500 rounded-2xl px-4 py-3 text-[8px] flex space-x-1">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce [animation-delay:0.2s]">●</span>
                <span className="animate-bounce [animation-delay:0.4s]">●</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-slate-950/40 border-t border-slate-800">
          <div className="relative">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message digital twin..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 pr-12 transition-all placeholder-slate-600"
            />
            <button 
              type="submit"
              disabled={isTyping || !inputValue.trim()}
              className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all disabled:opacity-30 active:scale-90"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RolePlayLab;
