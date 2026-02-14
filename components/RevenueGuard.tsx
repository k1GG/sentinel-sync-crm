import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_LOGS } from '../constants.tsx';
import { analyzeSentiment } from '../services/geminiService.ts';
import { Client, SentimentAnalysis } from '../types.ts';
import RiskBadge from './RiskBadge.tsx';

interface RevenueGuardProps {
  clients: Client[];
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
}

const RevenueGuard: React.FC<RevenueGuardProps> = ({ clients, selectedClientId, setSelectedClientId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [analysis, setAnalysis] = useState<SentimentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedClient = useMemo(() => 
    clients.find(c => c.id === selectedClientId) || clients[0],
    [clients, selectedClientId]
  );

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, clients]);

  const runAnalysis = async () => {
    if (!selectedClient) return;
    setLoading(true);
    const logs = MOCK_LOGS[selectedClient.id] || [];
    const result = await analyzeSentiment(logs, selectedClient.company);
    setAnalysis(result);
    setLoading(false);
  };

  useEffect(() => {
    setAnalysis(null);
  }, [selectedClientId]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter">Revenue Guard</h2>
          <p className="text-sm text-slate-400 max-w-lg font-medium">Deep analysis using Sentiment Velocity & Market Grounding logic.</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="relative group w-full">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">🔍</span>
            <input
              type="text"
              placeholder="Search intelligence profiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 px-4 py-4 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-bold"
              onChange={(e) => setSelectedClientId(e.target.value)}
              value={selectedClientId}
            >
              {filteredClients.map(c => (
                <option key={c.id} value={c.id}>{c.company} — {c.name}</option>
              ))}
            </select>
            
            <button 
              onClick={runAnalysis}
              disabled={loading || !selectedClient}
              className="sm:w-48 bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95 shadow-xl shadow-blue-900/40"
            >
              {loading ? <span className="animate-spin text-lg">⚙️</span> : <span>Scan Node</span>}
            </button>
          </div>
        </div>
      </header>

      {analysis ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-40"></div>
               <div className="flex items-center justify-between mb-8">
                  <h4 className="font-black text-white text-xs uppercase tracking-widest flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
                    Deep Insight Node
                  </h4>
                  <RiskBadge level={analysis.riskClassification} />
               </div>
               <div className="flex items-center space-x-6 mb-10 bg-slate-950/40 p-6 rounded-3xl border border-slate-800/50">
                 <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="35" fill="transparent" stroke="#1e293b" strokeWidth="5" />
                      <circle cx="40" cy="40" r="35" fill="transparent" stroke={analysis.healthScore > 70 ? '#10b981' : analysis.healthScore > 40 ? '#f59e0b' : '#f43f5e'} strokeWidth="5" strokeDasharray={220} strokeDashoffset={220 - (220 * analysis.healthScore) / 100} strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-xl font-black text-white">{analysis.healthScore}</span>
                 </div>
                 <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Silent Signal</p>
                    <p className="text-slate-200 italic text-sm leading-relaxed font-medium">"{analysis.silentSignal}"</p>
                 </div>
               </div>
               <div className="space-y-3">
                  <p className="text-[10px] font-black text-blue-400 uppercase mb-3 tracking-[0.2em]">Recovery Protocol</p>
                  {analysis.recoveryPlan.map((s, i) => (
                    <div key={i} className="p-4 bg-slate-950/30 rounded-2xl border border-slate-800/50 text-xs text-slate-300 flex items-start gap-4 hover:border-slate-700 transition-all group">
                      <span className="text-blue-500 font-black opacity-40 group-hover:opacity-100 transition-opacity">{i+1}</span>
                      {s}
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-40"></div>
               <h4 className="font-black text-white text-xs uppercase tracking-widest mb-6 flex items-center gap-3">
                 <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                 Macro-Risk Feed
               </h4>
               <div className="space-y-4">
                  {analysis.marketSignals && analysis.marketSignals.length > 0 ? (
                    analysis.marketSignals.map((sig, i) => (
                      <a href={sig.url} target="_blank" key={i} className="block p-5 bg-slate-950/30 rounded-[2rem] border border-slate-800 hover:border-blue-500/50 hover:bg-slate-950 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-sm font-bold text-white truncate max-w-[200px] group-hover:text-blue-400">{sig.title}</p>
                          <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase border ${sig.impact === 'negative' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                            {sig.impact}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">{sig.snippet}</p>
                        <div className="flex items-center justify-between mt-auto">
                           <p className="text-[9px] text-blue-500/60 font-black uppercase tracking-widest">{sig.source}</p>
                           <span className="text-xs text-slate-700 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-center text-slate-600 bg-slate-950/10 rounded-[2rem] border border-slate-800/50 p-8">
                      <div className="text-4xl mb-4 opacity-20">📡</div>
                      <p className="text-xs italic font-medium">No direct macro-risk threats detected for {selectedClient?.company} in current period.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 border-dashed rounded-[3rem] h-[500px] flex flex-col items-center justify-center text-center p-12 transition-all hover:bg-slate-900/60 group shadow-2xl">
           <div className="w-28 h-28 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-[2.5rem] border border-blue-500/20 flex items-center justify-center mb-10 relative shadow-inner">
              <div className="absolute inset-0 rounded-[2.5rem] border border-blue-500/10 animate-pulse scale-110"></div>
              <span className="text-6xl group-hover:scale-110 transition-transform duration-700">📡</span>
           </div>
           <h4 className="text-white font-black mb-4 text-2xl tracking-tighter uppercase italic">Revenue Guard Offline</h4>
           <p className="text-slate-500 text-sm max-w-sm mb-12 leading-relaxed font-medium">
             Link an account node to initiate deep forensic analysis. We correlate internal session data with Indian market dynamics.
           </p>
           <div className="flex gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-slate-800 group-hover:bg-blue-600 transition-all duration-700" style={{ transitionDelay: `${i*150}ms` }}></div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default RevenueGuard;
