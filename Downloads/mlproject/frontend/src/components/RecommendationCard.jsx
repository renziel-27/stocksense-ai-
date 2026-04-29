import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ShieldAlert } from 'lucide-react';

const CFG = {
  BUY:  {bg:'bg-emerald-900/40',border:'border-emerald-500/60',
          text:'text-emerald-400',badge:'bg-emerald-500',Icon:TrendingUp},
  HOLD: {bg:'bg-yellow-900/30', border:'border-yellow-500/50',
          text:'text-yellow-400',badge:'bg-yellow-500', Icon:Minus},
  SELL: {bg:'bg-red-900/30',    border:'border-red-500/50',
          text:'text-red-400',  badge:'bg-red-500',    Icon:TrendingDown},
};

export default function RecommendationCard({ rec, symbol }) {
  const [open, setOpen] = useState(false);
  if (!rec) return null;
  const cfg = CFG[rec.verdict] || CFG.HOLD;
  const { Icon } = cfg;
  const score = rec.final_score ?? 50;
  const bar = score>=68?'bg-emerald-500':score>=52?'bg-yellow-500':'bg-red-500';

  return (
    <div className={`rounded-2xl border p-6 mb-6 shadow-lg
                     ${cfg.bg} ${cfg.border}`}>

      {/* Top row */}
      <div className="flex flex-col md:flex-row gap-6 items-start
                      md:items-center">
        {/* Verdict badge */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className={`w-16 h-16 rounded-2xl ${cfg.badge}
                           flex items-center justify-center`}>
            <Icon className="w-8 h-8 text-white"/>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase
                          tracking-widest mb-1">AI Recommendation</p>
            <p className={`text-4xl font-bold ${cfg.text}`}>
              {rec.verdict}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">{symbol}</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between mb-1.5">
            <span className="text-slate-400 text-xs">Signal score</span>
            <span className={`font-mono font-bold text-sm ${cfg.text}`}>
              {score.toFixed(0)} / 100
            </span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all
                             duration-1000 ${bar}`}
                 style={{width:`${score}%`}}/>
          </div>
          <div className="flex justify-between mt-1 text-xs">
            <span className="text-red-400">Sell &lt;52</span>
            <span className="text-yellow-400">Hold 52-67</span>
            <span className="text-emerald-400">68+ Buy</span>
          </div>
        </div>

        {/* Action */}
        <div className="md:max-w-xs">
          <p className="text-slate-200 text-sm leading-relaxed">
            {rec.action}
          </p>
          <span className={`inline-flex items-center gap-1.5 mt-2
                            px-3 py-1 rounded-full text-xs font-medium
                            ${rec.risk_level==='HIGH'
                              ?'bg-red-900/50 text-red-400'
                              :rec.risk_level==='MEDIUM'
                              ?'bg-yellow-900/50 text-yellow-400'
                              :'bg-emerald-900/50 text-emerald-400'}`}>
            <ShieldAlert style={{width:12,height:12}}/>
            {rec.risk_level} — {rec.risk_note}
          </span>
        </div>
      </div>

      {/* Entry / Target / Stop-loss */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-5
                      border-t border-white/10">
        {[
          {l:'Entry',    v:`₹${rec.entry_price?.toLocaleString('en-IN',{minimumFractionDigits:2})}`,   sub:null, c:'text-slate-200'},
          {l:'Target',   v:`₹${rec.target_price?.toLocaleString('en-IN',{minimumFractionDigits:2})}`,  sub:rec.potential_return!=null?`+${rec.potential_return.toFixed(1)}%`:null, c:'text-emerald-400'},
          {l:'Stop-Loss',v:rec.stop_loss?`₹${rec.stop_loss?.toLocaleString('en-IN',{minimumFractionDigits:2})}`:'—', sub:rec.potential_loss!=null?`-${rec.potential_loss.toFixed(1)}%`:null, c:'text-red-400'},
        ].map(({l,v,sub,c},i)=>(
          <div key={i} className="text-center">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">{l}</p>
            <p className={`font-mono text-lg font-semibold ${c}`}>{v}</p>
            {sub&&<p className={`text-xs mt-0.5 ${c}`}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <button onClick={()=>setOpen(v=>!v)}
              className="mt-5 w-full py-2 border border-white/10
                         rounded-xl text-slate-400 text-sm
                         hover:bg-white/5 transition-all">
        {open?'Hide ▲':'Show signal breakdown ▼'}
      </button>

      {open && (
        <div className="mt-4 space-y-2">
          {Object.values(rec.scores||{}).map((s,i)=>(
            <div key={i} className="flex items-center gap-3">
              <span className="text-slate-400 text-xs w-44 flex-shrink-0">
                {s.label}
              </span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  s.score>=68?'bg-emerald-500':s.score>=50?'bg-yellow-500':'bg-red-500'
                }`} style={{width:`${s.score}%`}}/>
              </div>
              <span className="font-mono text-xs text-slate-400 w-8 text-right">
                {s.score?.toFixed(0)}
              </span>
              <span className="text-slate-600 text-xs w-8 text-right">
                ×{s.weight}
              </span>
            </div>
          ))}
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">
              Key factors
            </p>
            {(rec.reasons||[]).map((r,i)=>(
              <p key={i} className={`text-slate-300 text-sm flex gap-2 mb-1`}>
                <span className={cfg.text}>•</span>{r}
              </p>
            ))}
          </div>
        </div>
      )}

      <p className="text-slate-600 text-xs mt-4 pt-4
                    border-t border-white/5 leading-relaxed">
        {rec.disclaimer}
      </p>
    </div>
  );
}
