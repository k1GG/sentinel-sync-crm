
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_LOGS } from '../constants.tsx';
import { analyzeSentiment } from '../services/geminiService';
import { Client, SentimentAnalysis } from '../types';
import RiskBadge from './RiskBadge';

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
          <h2 className="text-2xl md:text-3xl font-bold text-white">Revenue Guard</h2>
          <p className="text-sm text-slate-400 max-w-lg">Deep analysis using Sentiment Velocity & Market Grounding.</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="relative group w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 group-focus-within:text-blue-500 transition-colors">🔍</span>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
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
              className="sm:w-48 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-95 shadow-lg shadow-blue-500/20"
            >
              {loading ? <span className="animate-spin text-lg">⚙️</span> : <span>Scan Intelligence</span>}
            </button>
          </div>
        </div>
      </header>

      {analysis ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          {/* Main Intel Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-30"></div>
               <div className="flex items-center justify-between mb-6">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">⚡ Deep Insight</h4>
                  <RiskBadge level={analysis.riskClassification} />
               </div>
               <div className="flex items-center space-x-6 mb-8 bg-slate-800/20 p-4 rounded-2xl border border-slate-800/50">
                 <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full -rotate-90"><circle cx="32" cy="32" r="28" fill="transparent" stroke="#1e293b" strokeWidth="4" /><circle cx="32" cy="32" r="28" fill="transparent" stroke={analysis.healthScore > 70 ? '#10b981' : analysis.healthScore > 40 ? '#f59e0b' : '#f43f5e'} strokeWidth="4" strokeDasharray={176} strokeDashoffset={176 - (176 * analysis.healthScore) / 100} /></svg>
                    <span className="absolute text-lg font-bold text-white">{analysis.healthScore}</span>
                 </div>
                 <div className="flex-1">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Silent Signal Detected</p>
                    <p className="text-slate-200 italic text-xs leading-relaxed font-medium">"{analysis.silentSignal}"</p>
                 </div>
               </div>
               <div className="space-y-2">
                  <p className="text-[10px] font-bold text-blue-400 uppercase mb-2 tracking-widest">Recovery Sequence</p>
                  {analysis.recoveryPlan.map((s, i) => (
                    <div key={i} className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50 text-[11px] text-slate-300 flex items-start gap-3 hover:border-slate-700 transition-all">
                      <span className="text-blue-500 font-bold opacity-50">{i+1}</span>
                      {s}
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-30"></div>
               <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-2">🌐 Macro-Risk Feed</h4>
               <div className="space-y-3">
                  {analysis.marketSignals && analysis.marketSignals.length > 0 ? (
                    analysis.marketSignals.map((sig, i) => (
                      <a href={sig.url} target="_blank" key={i} className="block p-4 bg-slate-950/30 rounded-2xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs font-bold text-white truncate max-w-[220px] group-hover:text-blue-400">{sig.title}</p>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${sig.impact === 'negative' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {sig.impact}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{sig.snippet}</p>
                        <div className="flex items-center justify-between mt-3">
                           <p className="text-[9px] text-blue-500/60 font-bold uppercase">{sig.source}</p>
                           <span className="text-[10px] text-slate-700">→</span>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-center text-slate-600 bg-slate-950/20 rounded-2xl border border-slate-800/50 p-6">
                      <div className="text-3xl mb-3 opacity-20">📡</div>
                      <p className="text-xs italic">No relevant macro-risk news found for {selectedClient?.company} in last 30 days. Market conditions stable.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* AI Situational Analysis Section */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/10 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
            <div className="absolute bottom-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <span className="text-9xl font-bold">ALPHA</span>
            </div>
            <div className="relative z-10">
              <h4 className="font-bold text-white text-lg mb-6 flex items-center gap-3">
                <span className="px-3 py-1 bg-cyan-500/10 rounded-full text-cyan-400 text-[10px] font-bold tracking-widest uppercase border border-cyan-500/20">Situational Analysis</span>
                {selectedClient?.company} Context
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-4">
                  <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
                    {analysis.industryContextSummary.split('\n\n').map((p, i) => (
                      <p key={i} className="mb-4">{p}</p>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-4 space-y-6">
                   <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800/60">
                      <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Sector Performance</h5>
                      <div className="flex items-end gap-2">
                        <div className="flex-1 h-12 bg-slate-800 rounded-t-md relative"><div className="absolute bottom-0 left-0 w-full h-[60%] bg-blue-500/20 rounded-t-md border-t border-blue-500/40"></div></div>
                        <div className="flex-1 h-12 bg-slate-800 rounded-t-md relative"><div className="absolute bottom-0 left-0 w-full h-[85%] bg-blue-500/30 rounded-t-md border-t border-blue-500/50"></div></div>
                        <div className="flex-1 h-12 bg-slate-800 rounded-t-md relative"><div className="absolute bottom-0 left-0 w-full h-[40%] bg-blue-500/10 rounded-t-md border-t border-blue-500/30"></div></div>
                        <div className="flex-1 h-12 bg-slate-800 rounded-t-md relative"><div className="absolute bottom-0 left-0 w-full h-[70%] bg-blue-500/20 rounded-t-md border-t border-blue-500/40"></div></div>
                      </div>
                      <p className="text-[9px] text-slate-600 mt-2 text-center uppercase font-bold">Relative to Industry Benchmark</p>
                   </div>
                   <div className="flex flex-col gap-2">
                     <span className="px-3 py-1.5 bg-slate-800/40 rounded-xl text-[10px] text-slate-400 font-bold uppercase tracking-widest border border-slate-700/50 flex justify-between">
                       Sector <span className="text-white">{selectedClient?.industry}</span>
                     </span>
                     <span className="px-3 py-1.5 bg-slate-800/40 rounded-xl text-[10px] text-slate-400 font-bold uppercase tracking-widest border border-slate-700/50 flex justify-between">
                       Tier <span className="text-white">Enterprise</span>
                     </span>
                   </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 group">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Executive Summary</h5>
                <span className="text-xs">📜</span>
              </div>
              <p className="text-[13px] text-slate-300 leading-relaxed font-medium">{analysis.executiveSummary}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 group">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-emerald-400 transition-colors">Recovery Action Draft</h5>
                <span className="text-xs">⚡</span>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 group-hover:border-emerald-500/20 transition-all">
                <p className="text-xs text-slate-200 italic font-mono leading-relaxed">"{analysis.engagementDraft}"</p>
              </div>
              <button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-2xl text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                Deploy Multi-Channel Protocol
                <span>🚀</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 border-dashed rounded-[40px] h-[500px] flex flex-col items-center justify-center text-center p-8 transition-all hover:bg-slate-900/60 group">
           <div className="w-24 h-24 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-full flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping"></div>
              <span className="text-5xl group-hover:scale-110 transition-transform duration-500">📡</span>
           </div>
           <h4 className="text-white font-bold mb-3 text-xl">Revenue Guard Offline</h4>
           <p className="text-slate-500 text-sm max-w-sm mb-10 leading-relaxed">
             Select an account from your portfolio to initiate a deep forensic scan. We'll cross-reference internal logs with real-time global market news to detect hidden churn vulnerabilities.
           </p>
           <div className="flex gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-slate-800 group-hover:bg-blue-600 transition-colors duration-500" style={{ transitionDelay: `${i*100}ms` }}></div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default RevenueGuard;
