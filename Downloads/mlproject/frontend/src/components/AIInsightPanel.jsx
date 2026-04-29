import React from 'react';
import { Bot, AlertTriangle, TrendingUp } from 'lucide-react';

export default function AIInsightPanel({
  summary = '',
  trend = 'Neutral',
  confidence = 0
}) {
  return (
    <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-5 h-full relative overflow-hidden">
      <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
        <Bot className="w-48 h-48" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-blue-400" />
        <h3 className="text-slate-300 font-semibold text-sm uppercase tracking-widest">
          AI Analysis
        </h3>
      </div>
      
      <p className="text-slate-300 text-sm leading-relaxed mb-6">
        {summary || 'Analysis will appear after prediction.'}
      </p>

      <div className="grid grid-cols-2 gap-4 border-t border-[#1E2D4F] pt-4">
         <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Generated Bias</p>
            <p className={`font-semibold ${trend === 'Bullish' ? 'text-emerald-400' : 'text-red-400'}`}>{trend}</p>
         </div>
         <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Model Confidence</p>
            <p className="font-mono text-slate-200">{confidence.toFixed(1)}%</p>
         </div>
      </div>
    </div>
  );
}
