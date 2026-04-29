import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { searchStocks } from '../data/stockUniverse';

const SECTOR_COLORS = {
  IT:             'bg-blue-900/50 text-blue-400',
  Banking:        'bg-emerald-900/50 text-emerald-400',
  Finance:        'bg-cyan-900/50 text-cyan-400',
  FMCG:           'bg-orange-900/50 text-orange-400',
  Pharma:         'bg-purple-900/50 text-purple-400',
  Auto:           'bg-yellow-900/50 text-yellow-400',
  Energy:         'bg-red-900/50 text-red-400',
  Metals:         'bg-slate-700/50 text-slate-300',
  Defense:        'bg-green-900/50 text-green-400',
  Infrastructure: 'bg-teal-900/50 text-teal-400',
  Renewables:     'bg-lime-900/50 text-lime-400',
  Tech:           'bg-violet-900/50 text-violet-400',
  Retail:         'bg-pink-900/50 text-pink-400',
  Fintech:        'bg-indigo-900/50 text-indigo-400',
};
const sectorColor = s =>
  SECTOR_COLORS[s] || 'bg-slate-800 text-slate-400';

export default function StockSearchBar({ value, onChange, onSelect }) {
  const [query,   setQuery]   = useState(value || '');
  const [results, setResults] = useState([]);
  const [open,    setOpen]    = useState(false);
  const [hi,      setHi]      = useState(0);
  const inputRef = useRef(null);
  const dropRef  = useRef(null);

  useEffect(() => {
    const fn = e => {
      if (!dropRef.current?.contains(e.target) &&
          !inputRef.current?.contains(e.target))
        setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleChange = e => {
    const v = e.target.value.toUpperCase();
    setQuery(v); onChange?.(v);
    setResults(searchStocks(v));
    setOpen(true); setHi(0);
  };

  const handleSelect = s => {
    setQuery(s.symbol); onChange?.(s.symbol);
    onSelect?.(s.symbol); setOpen(false);
  };

  const handleKey = e => {
    if (!open) return;
    if (e.key === 'ArrowDown')
      { e.preventDefault(); setHi(h => Math.min(h+1,results.length-1)); }
    else if (e.key === 'ArrowUp')
      { e.preventDefault(); setHi(h => Math.max(h-1,0)); }
    else if (e.key === 'Enter' && results[hi])
      handleSelect(results[hi]);
    else if (e.key === 'Escape') setOpen(false);
  };

  // Group by category
  const grouped = results.reduce((acc, s) => {
    const c = s.category || 'Other';
    (acc[c] = acc[c] || []).push(s);
    return acc;
  }, {});

  let idx = 0;

  return (
    <div className="relative flex-1">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2
                           text-slate-400 w-5 h-5 pointer-events-none"/>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKey}
          onFocus={() => { setResults(searchStocks(query)); setOpen(true); }}
          placeholder="Search stock (RELIANCE, TCS, HDFC Bank...)"
          autoComplete="off"
          className="w-full bg-[#141D35] border border-[#1E2D4F]
                     rounded-xl pl-12 pr-10 py-4 text-base text-slate-100
                     placeholder-slate-500 font-mono tracking-wide
                     focus:outline-none focus:border-blue-500
                     focus:ring-1 focus:ring-blue-500 transition-all"
        />
        {query && (
          <button onClick={() => {setQuery('');onChange?.('');setOpen(false);}}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                             text-slate-500 hover:text-slate-300">
            <X className="w-4 h-4"/>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div ref={dropRef}
             className="absolute top-full left-0 right-0 mt-2 z-50
                        bg-[#0F1629] border border-[#1E2D4F] rounded-xl
                        shadow-2xl shadow-black/50 max-h-72
                        overflow-y-auto">
          {Object.entries(grouped).map(([cat, stocks]) => (
            <div key={cat}>
              <div className="px-4 py-1.5 bg-[#141D35] border-b
                              border-[#1E2D4F] sticky top-0">
                <span className="text-slate-500 text-xs uppercase
                                 tracking-widest">{cat}</span>
              </div>
              {stocks.map(s => {
                const i = idx++;
                return (
                  <button key={s.symbol}
                          onMouseDown={() => handleSelect(s)}
                          onMouseEnter={() => setHi(i)}
                          className={`w-full flex items-center gap-3
                                      px-4 py-3 border-b border-[#1E2D4F]/50
                                      last:border-0 text-left transition-colors
                                      ${i===hi?'bg-blue-600/20':'hover:bg-[#141D35]'}`}>
                    <div className="w-28 flex-shrink-0">
                      <span className="font-mono text-sm font-bold
                                       text-slate-200">
                        {s.symbol.replace('.NS','')}
                      </span>
                      <span className="text-slate-600 text-xs">.NS</span>
                    </div>
                    <span className="flex-1 text-slate-400 text-sm truncate">
                      {s.name}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full
                                      flex-shrink-0 ${sectorColor(s.sector)}`}>
                      {s.sector}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
