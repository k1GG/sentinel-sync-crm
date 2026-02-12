
import React from 'react';
import { RiskLevel } from '../types';

const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const styles = {
    [RiskLevel.STABLE]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    [RiskLevel.COOLING]: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    [RiskLevel.CRITICAL]: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[level]}`}>
      {level.toUpperCase()}
    </span>
  );
};

export default RiskBadge;
