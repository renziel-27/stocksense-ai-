import { useState } from 'react';
import { Search } from 'lucide-react';

export default function StockInput({ onAnalyze, isLoading }) {
  const [symbol, setSymbol] = useState('RELIANCE.NS');
  const [period, setPeriod] = useState('1y');

  const periods = [
    { label: '3M', value: '3mo' },
    { label: '6M', value: '6mo' },
    { label: '1Y', value: '1y' },
    { label: '2Y', value: '2y' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (symbol.trim()) {
      onAnalyze(symbol.toUpperCase(), period);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-1 mb-8 relative group">
      <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-emerald-500/30 rounded-2xl blur-sm opacity-50 group-hover:opacity-80 transition duration-500"></div>
      <div className="relative bg-slate-950/80 backdrop-blur-xl rounded-2xl p-6">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-5 items-end">
        <div className="flex-1 w-full">
          <label htmlFor="symbol" className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide">
            Company Stock Symbol
          </label>
          <div className="glass-input relative w-full rounded-xl overflow-hidden group/input">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-transform group-focus-within/input:scale-110">
              <Search className="h-5 w-5 text-emerald-400" />
            </div>
            <input
              type="text"
              id="symbol"
              className="block w-full pl-12 pr-4 py-3.5 border-none bg-transparent text-white focus:ring-0 placeholder-slate-500 font-medium text-lg outline-none uppercase"
              placeholder="e.g. RELIANCE.NS, AAPL"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="w-full md:w-auto">
          <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide">
            Historical Data
          </label>
          <div className="flex bg-black/40 backdrop-blur-md rounded-xl p-1.5 border border-white/5 shadow-inner">
            {periods.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPeriod(p.value)}
                className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  period === p.value
                    ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300 active:scale-95 disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-3 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/20 w-full h-full -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search size={18} className="animate-pulse" />
              <span>Predict Future</span>
            </>
          )}
        </button>
      </form>
      </div>
    </div>
  );
}
