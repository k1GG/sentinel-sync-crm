
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'forecaster', label: 'Intelligence Hub', icon: '🔮' },
    { id: 'pulse', label: 'Audio Pulse', icon: '🎙️' },
    { id: 'clients', label: 'Revenue Guard', icon: '🛡️' },
    { id: 'warroom', label: 'Crisis War-Room', icon: '🔥' },
    { id: 'roleplay', label: 'Twin Lab', icon: '🤖' },
    { id: 'settings', label: 'Config', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0 hidden md:flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          SENTINEL-SYNC
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Intelligence Engine</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500"></div>
          <div>
            <p className="text-sm font-medium text-slate-200">Admin Account</p>
            <p className="text-xs text-slate-500">Revenue Director</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
