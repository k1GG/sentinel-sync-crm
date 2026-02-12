
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
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

  const activeClient = clients.find(c => c.id === selectedClientId) || clients[0];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-200">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full pb-24 md:pb-10 overflow-x-hidden">
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
          </div>
        )}
      </main>

      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <FloatingAIChat activeClient={activeClient} />
    </div>
  );
};

export default App;
