import React from 'react';

export default function StatCard({
  label = '',
  value = '-',
  sub = '',
  color = 'blue',
  icon = null,
  showRing = false,
  ringValue = 0
}) {
  return (
    <div className={`bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-4 flex flex-col justify-between h-full`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-slate-400 text-xs uppercase tracking-widest">{label}</h4>
        {icon && <div className={`text-${color}-400`}>{icon}</div>}
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-mono text-slate-100">{value}</span>
          {showRing && (
             <span className="text-xs bg-purple-900/40 text-purple-400 px-2 rounded-full border border-purple-500/30">
               {ringValue}%
             </span>
          )}
        </div>
        {sub && <p className={`text-xs mt-1 text-${color}-400 opacity-80`}>{sub}</p>}
      </div>
    </div>
  );
}
