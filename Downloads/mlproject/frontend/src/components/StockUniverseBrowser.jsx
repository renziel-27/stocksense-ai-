import React, { useState } from 'react';
import { STOCK_UNIVERSE } from '../data/stockUniverse';

export default function StockUniverseBrowser({ onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6 mb-6">
      <div 
        className="flex justify-between items-center cursor-pointer" 
        onClick={() => setOpen(!open)}
      >
        <div>
          <h3 className="text-lg font-bold text-slate-100">Browse Stock Universe</h3>
          <p className="text-slate-400 text-sm mt-1">
            Explore {Object.values(STOCK_UNIVERSE).flat().length} available stocks across different categories
          </p>
        </div>
        <button className="text-slate-400 hover:text-white font-medium transition-colors">
          {open ? 'Hide Directory ▲' : 'View All Stocks ▼'}
        </button>
      </div>

      {open && (
        <div className="mt-6 space-y-8 border-t border-[#1E2D4F] pt-6">
          {Object.entries(STOCK_UNIVERSE).map(([category, stocks]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-4 border-b border-[#1E2D4F] pb-2">
                <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
                  {category}
                </h4>
                <span className="px-2 py-0.5 bg-[#141D35] border border-[#1E2D4F] rounded-full text-xs text-slate-500 font-mono">
                  {stocks.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {stocks.map(s => (
                  <button
                    key={s.symbol}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(s.symbol);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-3 bg-[#141D35] border border-[#1E2D4F] hover:border-blue-500/50 hover:bg-blue-600/10 text-slate-300 rounded-xl text-left transition-all flex flex-col group"
                  >
                    <span className="font-mono font-bold text-sm text-blue-400 group-hover:text-blue-300 mb-1">
                      {s.symbol.replace('.NS', '')}
                    </span>
                    <span className="text-slate-500 text-xs truncate w-full group-hover:text-slate-300" title={s.name}>
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
