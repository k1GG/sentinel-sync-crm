
import React from 'react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: '📊' },
    { id: 'pulse', label: 'Pulse', icon: '🎙️' },
    { id: 'clients', label: 'Guard', icon: '🛡️' },
    { id: 'roleplay', label: 'Twins', icon: '🤖' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 px-4 py-2 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center space-y-1 px-3 py-1 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'text-blue-400' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
