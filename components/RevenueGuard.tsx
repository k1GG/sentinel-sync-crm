import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_LOGS } from '../constants';
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
          <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter">Revenue Guard</h2>
          <p className="text-sm text-slate-400 max-w-lg font-medium">Deep analysis using Sentiment Velocity & Market Grounding logic.</p>
        </div>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search intelligence profiles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full px-4 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-200 text-sm focus:outline-none"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <select 
              className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 px-4 py-4 rounded-2xl text-sm"
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
              className="sm:w-48 bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? <span className="animate-spin text-lg">⚙️</span> : <span>Scan Node</span>}
            </button>
          </div>
        </div>
      </header>
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
             <div className="flex items-center justify-between mb-8">
                <h4 className="font-black text-white text-xs uppercase tracking-widest">Deep Insight Node</h4>
                <RiskBadge level={analysis.riskClassification} />
             </div>
             <p className="text-slate-200 italic text-sm leading-relaxed mb-6">"{analysis.silentSignal}"</p>
             <div className="space-y-3">
                {analysis.recoveryPlan.map((s, i) => (
                  <div key={i} className="p-4 bg-slate-950/30 rounded-2xl border border-slate-800 text-xs text-slate-300">
                    {s}
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueGuard;
