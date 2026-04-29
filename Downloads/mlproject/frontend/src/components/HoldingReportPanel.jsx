import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { fetchHoldingReport } from '../services/api';

const PRESETS = [
  { label: '1W', days: 7 },
  { label: '2W', days: 14 },
  { label: '1M', days: 30 },
  { label: '2M', days: 60 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
];

export default function HoldingReportPanel({ prediction }) {
  const [buyPrice, setBuyPrice] = useState(prediction?.current_price || '');
  const [quantity, setQuantity] = useState(1);
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split('T')[0]);
  const [holdingDays, setHoldingDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const [showExit, setShowExit] = useState(false);
  const [showDates, setShowDates] = useState(false);

  if (!prediction) return null;

  const handleGenerate = async () => {
    if (!buyPrice || !quantity || !holdingDays) return;
    setLoading(true);
    setError(null);
    const payload = {
      symbol: prediction.symbol,
      buy_price: parseFloat(buyPrice),
      quantity: parseInt(quantity, 10),
      holding_days: parseInt(holdingDays, 10),
      buy_date: buyDate,
      current_price: prediction.current_price,
      predicted_price: prediction.predicted_price,
      indicators: prediction.indicators || {},
      recommendation: prediction.recommendation || {}
    };
    const { data, error: err } = await fetchHoldingReport(payload);
    if (err) setError(err);
    else setReport(data);
    setLoading(false);
  };

  const chartData = report ? report.scenarios.base.price_series.map((val, idx) => ({
    day: idx * Math.max(1, Math.floor(report.holding_days / report.scenarios.base.price_series.length)),
    base: val,
    bull: report.scenarios.bull.price_series[idx],
    bear: report.scenarios.bear.price_series[idx]
  })) : [];

  return (
    <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6 mt-6">
      <h3 className="text-xl font-bold text-slate-100 mb-4">Holding Period Report</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Buy Price (₹)</label>
          <input type="number" className="w-full bg-[#141D35] border border-[#1E2D4F] rounded-xl px-3 py-2 text-slate-200" 
                 value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Quantity</label>
          <input type="number" className="w-full bg-[#141D35] border border-[#1E2D4F] rounded-xl px-3 py-2 text-slate-200" 
                 value={quantity} onChange={e => setQuantity(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Buy Date</label>
          <input type="date" className="w-full bg-[#141D35] border border-[#1E2D4F] rounded-xl px-3 py-2 text-slate-200" 
                 value={buyDate} onChange={e => setBuyDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Holding Days</label>
          <input type="number" className="w-full bg-[#141D35] border border-[#1E2D4F] rounded-xl px-3 py-2 text-slate-200" 
                 value={holdingDays} onChange={e => setHoldingDays(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => setHoldingDays(p.days)}
                  className={`px-3 py-1 rounded-lg text-sm border transition-all
                  ${holdingDays === p.days ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#141D35] border-[#1E2D4F] text-slate-400 hover:text-slate-200'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <button onClick={handleGenerate} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50">
        {loading ? 'Generating...' : 'Generate Holding Report'}
      </button>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}

      {report && (
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F]">
              <p className="text-slate-400 text-xs uppercase mb-1">Investment</p>
              <p className="text-lg font-bold text-slate-200">₹{report.investment_value.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F]">
              <p className="text-slate-400 text-xs uppercase mb-1">Hold Until</p>
              <p className="text-lg font-bold text-slate-200">{report.exit_date}</p>
            </div>
            <div className="bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F]">
              <p className="text-slate-400 text-xs uppercase mb-1">Base Target</p>
              <p className="text-lg font-bold text-blue-400">₹{report.scenarios.base.final_price.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F]">
              <p className="text-slate-400 text-xs uppercase mb-1">Sharpe Ratio</p>
              <p className="text-lg font-bold text-emerald-400">{report.risk_metrics.sharpe_ratio.toFixed(2)}</p>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed p-4 bg-[#141D35] rounded-xl border border-[#1E2D4F] border-l-4 border-l-blue-500">
            {report.holding_verdict}
          </p>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4F" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickFormatter={v => `D${v}`} />
                <YAxis domain={['dataMin', 'dataMax']} stroke="#64748b" fontSize={12} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={{ backgroundColor: '#0F1629', borderColor: '#1E2D4F' }} />
                <ReferenceLine y={report.buy_price} stroke="#eab308" strokeDasharray="3 3" label={{ position: 'top', value: 'Buy Price', fill: '#eab308', fontSize: 10 }} />
                <Area type="monotone" dataKey="bull" stroke="#10b981" fillOpacity={0} strokeDasharray="5 5" />
                <Area type="monotone" dataKey="bear" stroke="#ef4444" fillOpacity={0} strokeDasharray="5 5" />
                <Area type="monotone" dataKey="base" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBase)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[report.scenarios.bull, report.scenarios.base, report.scenarios.bear].map((s, i) => (
              <div key={i} className="bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F]">
                <h4 className="text-slate-300 font-semibold mb-2">{s.label} ({s.probability}%)</h4>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500">Final Price</span>
                  <span className="text-sm font-mono text-slate-200">₹{s.final_price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-500">Return</span>
                  <span className={`text-sm font-mono ${s.return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.return_pct >= 0 ? '+' : ''}{s.return_pct}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">P&L</span>
                  <span className={`text-sm font-mono ${s.profit_loss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {s.profit_loss >= 0 ? '+' : '-'}₹{Math.abs(s.profit_loss).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-[#1E2D4F]">{s.description}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-[#1E2D4F] text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-2">Wk</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2 text-right">Price</th>
                  <th className="py-3 px-2 text-right">Return</th>
                  <th className="py-3 px-2 text-right">P&L</th>
                  <th className="py-3 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {report.milestones.map(m => (
                  <tr key={m.week} className="border-b border-[#1E2D4F]/50 last:border-0 hover:bg-[#141D35] transition-colors">
                    <td className="py-3 px-2 font-medium">{m.week}</td>
                    <td className="py-3 px-2 whitespace-nowrap text-slate-400">{m.date}</td>
                    <td className="py-3 px-2 text-right font-mono">₹{m.base_price.toLocaleString('en-IN')}</td>
                    <td className={`py-3 px-2 text-right font-mono ${m.return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.return_pct >= 0 ? '+' : ''}{m.return_pct}%
                    </td>
                    <td className={`py-3 px-2 text-right font-mono ${m.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {m.pnl >= 0 ? '+' : '-'}₹{Math.abs(m.pnl).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-2 text-xs text-slate-400">{m.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <button onClick={() => setShowExit(!showExit)} className="w-full text-left bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F] font-semibold text-slate-200 flex justify-between items-center">
              Exit Strategy {showExit ? '▲' : '▼'}
            </button>
            {showExit && (
              <div className="mt-2 space-y-2 p-4 bg-[#0F1629] border border-[#1E2D4F] rounded-xl">
                {Object.entries(report.exit_strategy).map(([key, strat]) => (
                  <div key={key} className="flex justify-between items-center p-2 border-b border-[#1E2D4F] last:border-0">
                    <span className="text-slate-300 capitalize">{key.replace('_', ' ')}</span>
                    <span className="text-slate-400">{strat.action}</span>
                    {strat.price && <span className="font-mono text-emerald-400">₹{strat.price.toLocaleString('en-IN')}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <button onClick={() => setShowDates(!showDates)} className="w-full text-left bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F] font-semibold text-slate-200 flex justify-between items-center">
              Key Dates {showDates ? '▲' : '▼'}
            </button>
            {showDates && (
              <div className="mt-2 space-y-2 p-4 bg-[#0F1629] border border-[#1E2D4F] rounded-xl">
                {report.key_dates.length === 0 ? <p className="text-slate-400 text-sm">No key dates in this period.</p> :
                  report.key_dates.map((kd, i) => (
                  <div key={i} className="flex justify-between items-center p-2 border-b border-[#1E2D4F] last:border-0">
                    <span className="text-slate-300 font-medium w-24">{kd.date}</span>
                    <span className="text-slate-200 flex-1">{kd.event}</span>
                    <span className="text-slate-500 text-xs">{kd.note}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500 text-center">{report.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
