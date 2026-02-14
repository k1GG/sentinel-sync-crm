
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
import { MOCK_CLIENTS } from './constants.tsx';
import { Client } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string>(MOCK_CLIENTS[0].id);
  const [hasClearance, setHasClearance] = useState(!!process.env.API_KEY && process.env.API_KEY !== "undefined");

  useEffect(() => {
    // Re-check clearance if the environment variable updates
    if (process.env.API_KEY && process.env.API_KEY !== "undefined") {
      setHasClearance(true);
    }
  }, []);

  const handleAuthorize = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Per guidelines, assume success and proceed to the app
      setHasClearance(true);
    } else {
      alert("API Key Selector not available in this environment. Ensure you are running in the correct AI Studio context.");
    }
  };

  const activeClient = clients.find(c => c.id === selectedClientId) || clients[0];

  if (!hasClearance) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 bg-blue-600/20 rounded-[2rem] border border-blue-500/30 flex items-center justify-center mx-auto mb-8 relative z-10">
              <span className="text-4xl">🔐</span>
            </div>
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-150 opacity-50"></div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Clearance Required</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sentinel-Sync's intelligence engine is currently offline. Your deployment environment requires a manual authorization link to access the Gemini API.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">Protocol Status</p>
              <div className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-xs font-mono text-slate-300">API_KEY_UNDEFINED</span>
              </div>
            </div>
            
            <button 
              onClick={handleAuthorize}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              Authorize Intelligence Engine
              <span>→</span>
            </button>
            
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              Authorization happens locally. Your key is never stored on our servers. 
              <br />Visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-400 underline ml-1">billing docs</a> for requirements.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-slate-800 text-2xl">⚙️</div>
               <h2 className="text-xl md:text-2xl font-bold text-white mb-2">System Configuration</h2>
               <p className="text-sm md:text-base text-slate-400 max-w-md">Connect your API hooks to WhatsApp, Gmail, and Salesforce.</p>
               <button 
                 onClick={handleAuthorize}
                 className="mt-8 text-xs font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest"
               >
                 Re-Authorize API Engine
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
