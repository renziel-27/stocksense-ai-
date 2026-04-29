import React from 'react';

export default function PatternCard({ pattern }) {
  if (!pattern) return null;
  const {
    pattern_name  = 'Unknown',
    pattern_type  = 'neutral',
    confidence    = 0,
    description   = '',
    target_price  = null,
    stop_loss     = null,
  } = pattern;

  const isBullish = pattern_type.toLowerCase() === 'bullish';
  const color = isBullish ? 'emerald' : pattern_type.toLowerCase() === 'bearish' ? 'red' : 'blue';

  return (
    <div className={`bg-[#141D35] border border-[#1E2D4F] rounded-xl p-4 mb-3 border-l-4 border-l-${color}-500`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className={`text-${color}-400 font-semibold text-sm`}>{pattern_name}</h4>
        <span className={`text-xs px-2 py-1 rounded bg-${color}-900/30 text-${color}-400 font-medium`}>
          {confidence}% Conf.
        </span>
      </div>
      <p className="text-slate-400 text-xs leading-relaxed mb-3">{description}</p>
      
      {(target_price || stop_loss) && (
        <div className="flex gap-4 border-t border-[#1E2D4F] pt-2 mt-2">
          {target_price && (
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider">Target</p>
              <p className="font-mono text-emerald-400 text-xs">₹{target_price.toFixed(2)}</p>
            </div>
          )}
          {stop_loss && (
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider">Stop Loss</p>
              <p className="font-mono text-red-400 text-xs">₹{stop_loss.toFixed(2)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
