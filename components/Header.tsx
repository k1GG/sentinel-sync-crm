import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-900/40">
          S
        </div>
        <div className="flex flex-col">
          <h1 className="text-base md:text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-none">
            Sentinel-Sync CRM
          </h1>
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
            Revenue Protection Engine
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
             System Nominal
           </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs hover:bg-slate-700 transition-colors">
            🔔
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
