
import React, { useState, useEffect } from 'react';
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

  const industries = Array.from(new Set(clients.map(c => c.industry)));

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
            <span className="animate-spin text-4xl mb-4">🌀</span>
            <p className="text-xs text-slate-500 animate-pulse uppercase font-bold tracking-tighter">Scanning Government Gazettes...</p>
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
           <span className="text-4xl mb-4 opacity-20">🍃</span>
           <p className="text-slate-500 text-sm font-medium">No critical regulatory shocks found for {activeIndustry} founders in current cycle.</p>
        </div>
      );
    }

    return shocks.map((shock, i) => (
      <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-cyan-500/10 transition-colors"></div>
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h5 className="text-white font-bold text-base group-hover:text-cyan-400 transition-colors">{shock.title}</h5>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{shock.source}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Impact Score</p>
            <div className="text-xl font-black text-rose-500">{shock.impactScore}/10</div>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mb-6 relative z-10">{shock.summary}</p>
        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-4 relative z-10">
          <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-1">Strategic Recovery Step</p>
          <p className="text-xs text-slate-200 font-medium">{shock.actionableTip}</p>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Regulatory Sentinel</span>
          </div>
          <h2 className="text-3xl font-bold text-white">External Shock Forecast</h2>
          <p className="text-slate-400">Predicting churn via Indian macro-policy shifts and regional signals.</p>
        </div>
        <button 
          onClick={fetchShocks}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-700 transition-all active:scale-95"
        >
          🔄 Refresh Intelligence
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        {industries.map(ind => (
          <button
            key={ind}
            onClick={() => setActiveIndustry(ind)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeIndustry === ind 
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' 
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            {ind}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Policy Shocks</h4>
          {renderContent()}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/30 rounded-[32px] p-6 relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 text-6xl opacity-10 group-hover:rotate-12 transition-transform">🎙️</div>
             <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               Regional Audio Pulse
               <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
             </h4>
             <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
               Detecting stress signals in Hinglish voice notes for {activeIndustry} founders.
             </p>
             <div className="space-y-4">
               {[
                 { label: 'Tonal Frustration', val: 78, color: 'bg-rose-500' },
                 { label: 'Budget Anxiety', val: 42, color: 'bg-amber-500' },
                 { label: 'Language Switching', val: 65, color: 'bg-indigo-500' }
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
             <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Preemptive Nudge</p>
                <button className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-indigo-500/20 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95">
                  Request High-Touch Call
                </button>
             </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 group">
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Revenue Swap Potential</h4>
             <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl group-hover:border-emerald-500/40 transition-colors">
                <p className="text-[11px] text-slate-300 italic mb-3">"Sector budget for AI is shifting to Compliance Tooling."</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase">Proposed Pivot:</p>
                <p className="text-[11px] text-white mt-1">Offer free 'Safety Guard' module for 3 months to prevent total churn.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecaster;
