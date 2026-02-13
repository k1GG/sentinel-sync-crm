
import React, { useRef, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Client, RiskLevel, Alert } from '../types';
import RiskBadge from './RiskBadge';

interface DashboardProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const Dashboard: React.FC<DashboardProps> = ({ clients, setClients }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', name: 'Critical Revenue Drop', type: 'mrr_threshold', condition: 'below', value: 50000, active: true },
    { id: '2', name: 'Risk Escalation Monitor', type: 'risk_level', condition: 'equals', value: RiskLevel.CRITICAL, active: true }
  ]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<Alert>>({ 
    name: '', 
    type: 'mrr_threshold', 
    condition: 'below', 
    value: 0 
  });

  const stats = useMemo(() => [
    { label: 'At Risk', value: `₹${(clients.filter(c => c.healthScore < 50).reduce((acc, c) => acc + c.mrr, 0) / 100000).toFixed(1)}L`, change: '+12%', color: 'text-rose-500' },
    { label: 'Total MRR', value: `₹${(clients.reduce((acc, c) => acc + c.mrr, 0) / 100000).toFixed(1)}L`, change: '+25%', color: 'text-emerald-500' },
    { label: 'Zombies', value: clients.filter(c => c.isZombie).length.toString(), change: '+2', color: 'text-amber-500' },
    { label: 'Avg Health', value: `${clients.length > 0 ? Math.round(clients.reduce((acc, c) => acc + c.healthScore, 0) / clients.length) : 0}%`, change: '-4%', color: 'text-blue-500' },
  ], [clients]);

  const chartData = [
    { name: 'M', risk: 40 }, { name: 'T', risk: 45 }, { name: 'W', risk: 50 },
    { name: 'T', risk: 35 }, { name: 'F', risk: 30 }, { name: 'S', risk: 55 },
    { name: 'S', risk: 60 }
  ];

  const riskDistributionData = useMemo(() => [
    { name: 'Stable', count: clients.filter(c => c.riskLevel === RiskLevel.STABLE).length, color: '#10b981' },
    { name: 'Cooling', count: clients.filter(c => c.riskLevel === RiskLevel.COOLING).length, color: '#f59e0b' },
    { name: 'Critical', count: clients.filter(c => c.riskLevel === RiskLevel.CRITICAL).length, color: '#f43f5e' }
  ], [clients]);

  const triggeredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (!alert.active) return false;
      return clients.some(client => {
        if (alert.clientId && client.id !== alert.clientId) return false;
        
        if (alert.type === 'mrr_threshold') {
          const val = alert.value as number;
          if (alert.condition === 'below') return client.mrr < val;
          if (alert.condition === 'above') return client.mrr > val;
        }
        if (alert.type === 'risk_level') {
          return client.riskLevel === alert.value;
        }
        return false;
      });
    });
  }, [alerts, clients]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Company', 'MRR', 'Health', 'Risk', 'Industry', 'Last'];
    const rows = clients.map(c => [c.id, c.name, c.company, c.mrr, c.healthScore, c.riskLevel, c.industry, c.lastInteraction]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sentinel_export.csv`;
    link.click();
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').slice(1);
      const newClients: Client[] = lines.filter(l => l.trim()).map(line => {
        const p = line.split(',');
        return {
          id: p[0] || Math.random().toString(36).substr(2, 9),
          name: p[1] || 'Imported',
          company: p[2] || 'New Org',
          mrr: parseInt(p[3]) || 0,
          healthScore: parseInt(p[4]) || 70,
          riskLevel: (p[5] as RiskLevel) || RiskLevel.STABLE,
          industry: p[6] || 'SaaS',
          lastInteraction: p[7] || new Date().toISOString(),
          sentimentTrend: 'stable',
          isZombie: false
        };
      });
      setClients(prev => [...prev, ...newClients]);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-20 overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">Operational Command</h2>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time revenue signals live for India SaaS.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <input type="file" ref={fileInputRef} onChange={handleImportCSV} accept=".csv" className="hidden" />
          <button
            onClick={() => setIsAlertModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-600/30 transition-all text-xs font-bold active:scale-95"
          >
            <span className="text-lg">🔔</span>
            <span>Configure Alerts</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl border border-blue-600/30 transition-all text-xs font-bold active:scale-95"
          >
            <span className="text-lg">⊕</span>
            <span>Import</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-all text-xs font-bold active:scale-95"
          >
            <span className="text-lg">↓</span>
            <span>Export</span>
          </button>
        </div>
      </header>

      {triggeredAlerts.length > 0 && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-4">
            <span className="p-2 bg-rose-500/20 rounded-xl text-lg">⚠️</span>
            <h4 className="text-sm font-bold text-rose-500 uppercase tracking-widest">Active Violations</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {triggeredAlerts.map(alert => (
              <div key={alert.id} className="bg-slate-900 border border-rose-500/30 px-4 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
                <div>
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter">Triggered</p>
                  <p className="text-sm font-bold text-white">{alert.name}</p>
                </div>
                <div className="h-8 w-[1px] bg-slate-800"></div>
                <button 
                  onClick={() => setAlerts(prev => prev.map(a => a.id === alert.id ? {...a, active: false} : a))}
                  className="text-[10px] font-bold text-slate-400 hover:text-white uppercase"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 min-w-0">
        {stats.map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl group hover:border-blue-500/30 transition-all min-w-0 overflow-hidden">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{s.label}</p>
            <div className="flex items-end justify-between overflow-hidden">
              <h3 className="text-2xl md:text-3xl font-extrabold text-white leading-tight truncate">{s.value}</h3>
              <div className={`flex items-center text-xs font-bold ${s.color} bg-${s.color.split('-')[1]}-500/10 px-2 py-0.5 rounded-lg ml-2`}>
                {s.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-w-0 overflow-hidden">
        <div className="lg:col-span-8 space-y-8 min-w-0">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group min-h-[400px]">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-6xl">📈</div>
            <h4 className="text-base font-bold text-white mb-8 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Revenue Health Analytics
            </h4>
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minHeight={288} debounce={50}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} dy={10} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.1)'}}
                    itemStyle={{color: '#f8fafc', fontWeight: 'bold'}}
                  />
                  <Area type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl min-w-0 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                Critical Watchlist
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clients.filter(c => c.healthScore < 50).slice(0, 4).map((client) => (
                <div key={client.id} className="flex items-center justify-between p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-all hover:translate-x-1 overflow-hidden">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className={`w-1 h-10 rounded-full flex-shrink-0 ${client.riskLevel === RiskLevel.CRITICAL ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-amber-500'}`}></div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-100 truncate">{client.company}</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest truncate">{client.name}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-slate-500 font-bold mb-1">₹{(client.mrr/1000).toFixed(0)}k</p>
                    <RiskBadge level={client.riskLevel} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8 min-w-0">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl min-h-[300px]">
            <h4 className="text-base font-bold text-white mb-8">Risk Tier Distribution</h4>
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minHeight={256} debounce={50}>
                <BarChart data={riskDistributionData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 600}} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
