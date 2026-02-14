import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import Dashboard from './components/Dashboard';
import RevenueGuard from './components/RevenueGuard';
import RolePlayLab from './components/RolePlayLab';
import WarRoom from './components/WarRoom';
import Forecaster from './components/Forecaster';
import VoicePulse from './components/VoicePulse';
import FloatingAIChat from './components/FloatingAIChat';
import { MOCK_CLIENTS } from './constants';
import { Client } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>(MOCK_CLIENTS[0].id);
  
  // Intelligence clearance state
  const [hasClearance, setHasClearance] = useState(
    !!process.env.API_KEY && process.env.API_KEY !== "undefined" && process.env.API_KEY !== ""
  );

  // Monitor for external key injections (common in aistudio environments)
  useEffect(() => {
    const checkKey = () => {
      if (process.env.API_KEY && process.env.API_KEY !== "undefined" && process.env.API_KEY !== "") {
        setHasClearance(true);
      }
    };
    const interval = setInterval(checkKey, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthorize = async () => {
    if (window.aistudio?.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        // As per guidelines: Assume success immediately after opening dialog to handle race conditions
        setHasClearance(true);
      } catch (err) {
        console.error("Authorization flow interrupted", err);
      }
    } else {
      // Fallback for non-aistudio environments
      setHasClearance(true); 
    }
  };

  const activeClient = clients.find(c => c.id === selectedClientId) || clients[0];

  // Global Clearance Guard
  if (!hasClearance) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-10 animate-in fade-in zoom-in duration-700">
          <div className="relative">
            <div className="w-28 h-28 bg-blue-600/10 rounded-[2.5rem] border border-blue-500/30 flex items-center justify-center mx-auto mb-8 relative z-10 shadow-[0_0_50px_rgba(37,99,235,0.15)]">
              <span className="text-5xl">🔒</span>
            </div>
            <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full scale-150 opacity-40"></div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Clearance Restricted</h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto font-medium">
              Sentinel-Sync's intelligence node is currently disconnected. Manual cryptographic link to Gemini backbone is required.
            </p>
          </div>

          <div className="p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[3rem] space-y-8 shadow-2xl relative">
            <button 
              onClick={handleAuthorize}
              className="group w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all active:scale-95 flex items-center justify-center gap-4 border border-blue-400/20"
            >
              Link Intelligence Engine
              <span className="group-hover:translate-x-1 transition-transform text-lg">→</span>
            </button>
            <div className="pt-4 border-t border-slate-800/50">
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                Authorization happens via a secure bridge.
                <br />
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-bold hover:text-blue-300 underline underline-offset-4 transition-colors">Review Billing Docs</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/20 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
        <Header />

        <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10">
          {activeTab === 'dashboard' && <Dashboard clients={clients} setClients={setClients} />}
          {activeTab === 'forecaster' && <Forecaster clients={clients} />}
          {activeTab === 'pulse' && <VoicePulse />}
          {activeTab === 'clients' && <RevenueGuard clients={clients} selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId} />}
          {activeTab === 'warroom' && <WarRoom clients={clients} />}
          {activeTab === 'roleplay' && <RolePlayLab clients={clients} selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId} />}
          {activeTab === 'settings' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in slide-in-from-bottom-5">
               <div className="w-20 h-20 bg-slate-900/50 rounded-3xl flex items-center justify-center mb-6 border border-slate-800 text-3xl shadow-xl">⚙️</div>
               <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic">System Node Config</h2>
               <p className="text-sm text-slate-400 max-w-md font-medium">Manage API bridges, webhook listeners, and intelligence authorization.</p>
               <button 
                 onClick={handleAuthorize}
                 className="mt-10 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-slate-700 shadow-xl active:scale-95"
               >
                 Re-Authorize Intelligence Link
               </button>
            </div>
          )}
        </main>

        <Footer />
      </div>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <FloatingAIChat activeClient={activeClient} />
    </div>
  );
};

export default App;
