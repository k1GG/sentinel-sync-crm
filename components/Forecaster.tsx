
import React, { useState, useEffect, useMemo } from 'react';
import { analyzeExternalShocks } from '../services/geminiService';
import { Client } from '../types';

interface ForecasterProps {
  clients: Client[];
}

const Forecaster: React.FC<ForecasterProps> = ({ clients }) => {
  const [activeIndustry, setActiveIndustry] = useState('EdTech');
  const [shocks, setShocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const industries = useMemo(() => Array.from(new Set(clients.map(c => c.industry))), [clients]);
  
  const affectedClients = useMemo(() => {
    return clients.filter(c => c.industry === activeIndustry);
  }, [clients, activeIndustry]);

  const fetchShocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeExternalShocks(activeIndustry);
      if (data && data.shocks) {
        setShocks(data.shocks);
      } else {
        setShocks([]);
      }
    } catch (e: any) {
      setError("Intelligence quota reached. Please try in a few moments.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShocks();
  }, [activeIndustry]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="h-64 bg-slate-900/50 rounded-[40px] flex items-center justify-center border border-slate-800 border-dashed">
          <div className="flex flex-col items-center">
            <span className="animate-spin text-4xl mb-4">⚖️</span>
            <p className="text-xs text-slate-500 animate-pulse uppercase font-bold tracking-tighter">Scanning Regulatory Cycles...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-10 bg-rose-500/10 border border-rose-500/20 rounded-[40px] text-center">
          <p className="text-rose-400 text-sm font-bold mb-4">{error}</p>
          <button 
            onClick={fetchShocks}
            className="px-8 py-3 bg-rose-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-rose-900/40 uppercase tracking-widest active:scale-95 transition-all"
          >
            Retry Protocol
          </button>
        </div>
      );
    }

    if (shocks.length === 0) {
      return (
        <div className="h-64 bg-slate-900 border border-slate-800 rounded-[40px] flex flex-col items-center justify-center text-center p-8">
           <span className="text-4xl mb-4 opacity-20">📜</span>
           <p className="text-slate-500 text-sm font-medium">No critical regulatory shocks found for {activeIndustry} founders in current cycle.</p>
        </div>
      );
    }

    return shocks.map((shock, i) => (
      <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/30 transition-all group relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-cyan-500/10 transition-colors"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-500 text-[8px] font-black rounded border border-cyan-500/20 uppercase">INTELLIGENCE FEED</span>
               <h5 className="text-white font-bold text-base group-hover:text-cyan-400 transition-colors">{shock.title}</h5>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{shock.source}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Churn Risk</p>
            <div className="text-xl font-black text-rose-500">{(shock.impactScore * 10)}%</div>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-6 relative z-10">{shock.summary}</p>
        
        {shock.complianceDeadline && (
          <div className="mb-4 flex items-center gap-2 text-[10px] font-bold text-amber-500 uppercase">
             <span>⏱️ Compliance Deadline:</span>
             <span className="bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{shock.complianceDeadline}</span>
          </div>
        )}

        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-4 relative z-10">
          <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-1">Revenue Protection Strategy</p>
          <p className="text-xs text-slate-200 font-medium italic">"{shock.actionableTip}"</p>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24 min-w-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Compliance Sentinel v3.0</span>
          </div>
          <h2 className="text-3xl font-bold text-white">External Shock Forecast</h2>
          <p className="text-slate-400">Predicting churn via GoI Gazettes, MCA updates, and RBI regional mandates.</p>
        </div>
        <button 
          onClick={fetchShocks}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-all active:scale-95"
        >
          🔄 Force Refresh
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {industries.map(ind => (
          <button
            key={ind}
            onClick={() => setActiveIndustry(ind)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeIndustry === ind 
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40 border border-cyan-400/30' 
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {ind}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0">
        <div className="lg:col-span-8 space-y-4 min-w-0">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Policy Shocks (India)</h4>
          {renderContent()}
        </div>

        <div className="lg:col-span-4 space-y-6 min-w-0">
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 shadow-xl">
             <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center justify-between">
               Exposed Accounts
               <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 text-[8px] rounded-full border border-rose-500/20">High Alert</span>
             </h4>
             <div className="space-y-3">
                {affectedClients.length > 0 ? (
                  affectedClients.map(c => (
                    <div key={c.id} className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 hover:border-slate-700 transition-all">
                       <div className="flex justify-between items-center mb-1">
                          <p className="text-xs font-bold text-white truncate">{c.company}</p>
                          <span className="text-[10px] font-black text-rose-400">₹{(c.mrr/1000).toFixed(0)}k</span>
                       </div>
                       <div className="flex items-center justify-between">
                          <p className="text-[9px] text-slate-500 uppercase font-bold">Policy Exposure: HIGH</p>
                          <div className="flex gap-0.5">
                             {[1,2,3].map(i => <div key={i} className={`w-1 h-1 rounded-full ${i <= 2 ? 'bg-rose-500' : 'bg-slate-800'}`}></div>)}
                          </div>
                       </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-600 italic">No matching clients found.</p>
                )}
             </div>
             <button className="w-full mt-6 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-700 transition-all">
                Broadcast Compliance Alert
             </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/30 rounded-[32px] p-6 relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 text-6xl opacity-10 group-hover:rotate-12 transition-transform">⚖️</div>
             <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               Regulatory Pulse
               <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
             </h4>
             <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
               Sentinel is cross-referencing MRR against GST Council minutes.
             </p>
             <div className="space-y-4">
               {[
                 { label: 'Technical Debt', val: 62, color: 'bg-indigo-500' },
                 { label: 'Opex Inflation', val: 84, color: 'bg-rose-500' },
                 { label: 'Renewal Resistance', val: 35, color: 'bg-amber-500' }
               ].map((stat, i) => (
                 <div key={i} className="space-y-2">
                   <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                     <span>{stat.label}</span>
                     <span className="text-white">{stat.val}%</span>
                   </div>
                   <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                     <div className={`h-full ${stat.color} transition-all duration-1000`} style={{ width: `${stat.val}%` }}></div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecaster;
