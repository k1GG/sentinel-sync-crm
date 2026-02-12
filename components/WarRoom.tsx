
import React, { useState } from 'react';
import { Client, RiskLevel } from '../types';
import RiskBadge from './RiskBadge';
import { generateBattlePlan } from '../services/geminiService';

interface WarRoomProps {
  clients: Client[];
}

const WarRoom: React.FC<WarRoomProps> = ({ clients }) => {
  const criticalClients = clients.filter(c => c.riskLevel === RiskLevel.CRITICAL || c.riskLevel === RiskLevel.COOLING);
  const [selectedId, setSelectedId] = useState(criticalClients[0]?.id || '');
  const [battlePlan, setBattlePlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const activeClient = criticalClients.find(c => c.id === selectedId);

  const triggerBattlePlan = async () => {
    if (!activeClient) return;
    setLoading(true);
    setError(null);
    try {
      const plan = await generateBattlePlan(activeClient.name, activeClient.company, activeClient.riskLevel);
      setBattlePlan(plan);
    } catch (e: any) {
      setError(e.message || "Intelligence engine offline.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">Revenue Frontline</span>
          </div>
          <h2 className="text-3xl font-bold text-white">Crisis War-Room</h2>
          <p className="text-slate-400">High-intensity tactical modules for critical accounts.</p>
        </div>
        {activeClient && (
          <button 
            onClick={triggerBattlePlan}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-900/40 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? <span className="animate-spin text-lg">⚙️</span> : <span>🔥 Generate War-Plan</span>}
          </button>
        )}
      </header>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold text-center">
          Intelligence generation reached capacity. Please wait a moment and try again.
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Incident List */}
        <div className="xl:col-span-1 space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Targeted Assets</h4>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {criticalClients.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelectedId(c.id); setBattlePlan(null); setError(null); }}
                className={`w-full p-4 rounded-2xl text-left border transition-all relative overflow-hidden group ${
                  selectedId === c.id 
                  ? 'bg-rose-500/10 border-rose-500/30 ring-1 ring-rose-500/50' 
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <p className="font-bold text-white truncate max-w-[140px]">{c.company}</p>
                  <span className={`text-[10px] font-bold ${c.riskLevel === 'Critical' ? 'text-rose-500' : 'text-amber-500'}`}>
                    ₹{(c.mrr/1000).toFixed(0)}k
                  </span>
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Health: {c.healthScore}%</p>
                  <RiskBadge level={c.riskLevel} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Incident Detail / Battle Cards */}
        <div className="xl:col-span-3 space-y-6">
          {activeClient ? (
            battlePlan ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in-95 duration-500">
                {/* Psychological Edge */}
                <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 relative group overflow-hidden">
                  <div className="absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-100 transition-opacity">🧠</div>
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Psychological Edge</h4>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">{battlePlan.psychologicalEdge}</p>
                </div>

                {/* Defensive Pivot */}
                <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-500/30 rounded-3xl p-6 relative group overflow-hidden">
                  <div className="absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-100 transition-opacity">🛡️</div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Defensive Pivot</h4>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">{battlePlan.defensivePivot}</p>
                </div>

                {/* Revenue Swap Offer (Blue Ocean Feature) */}
                <div className="md:col-span-2 bg-gradient-to-r from-emerald-950/40 to-cyan-950/40 border border-emerald-500/30 rounded-3xl p-6 relative group overflow-hidden">
                  <div className="absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-100 transition-opacity">♻️</div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Blue Ocean Revenue Swap</h4>
                  <p className="text-base text-white leading-relaxed font-bold mb-2">{battlePlan.revenueSwapOffer}</p>
                  <p className="text-xs text-slate-400">Offer this alternative to protect MRR while shifting the client to a higher-value ecosystem.</p>
                </div>

                {/* Expansion Hook */}
                <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 relative group overflow-hidden">
                  <div className="absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-100 transition-opacity">🎣</div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Expansion Hook</h4>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">{battlePlan.expansionHook}</p>
                </div>

                {/* Nuclear Option */}
                <div className="bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/30 rounded-3xl p-6 relative group overflow-hidden">
                  <div className="absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-100 transition-opacity">☢️</div>
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4">The Nuclear Option</h4>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium italic">{battlePlan.nuclearOption}</p>
                </div>

                {/* Stakeholder Intel */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Stakeholder Intel</h4>
                   <p className="text-sm text-slate-300 leading-relaxed">{battlePlan.stakeholderIntel}</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl h-[400px] flex flex-col items-center justify-center text-center p-8">
                <div className="text-5xl mb-6 grayscale opacity-50">📋</div>
                <h3 className="text-white font-bold text-lg mb-2">Battle Intelligence Needed</h3>
                <p className="text-slate-500 text-sm max-w-sm mb-8">Select {activeClient.company} and trigger the AI generator to build a customized, high-stakes recovery plan.</p>
                <button 
                  onClick={triggerBattlePlan}
                  disabled={loading}
                  className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-3 active:scale-95 shadow-xl"
                >
                  {loading ? <span className="animate-spin">⚙️</span> : "Analyze Strategic Edge"}
                </button>
              </div>
            )
          ) : (
             <div className="bg-slate-900 border border-slate-800 rounded-3xl h-64 flex flex-col items-center justify-center text-center p-8">
                <div className="text-4xl mb-4">🎉</div>
                <h4 className="text-white font-bold">Safe Zone</h4>
                <p className="text-slate-500 text-sm">No critical threats detected. All systems stable.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WarRoom;
