import React from 'react';

export default function IndicatorsPanel({ indicators = {}, data = [] }) {
  if (!indicators || Object.keys(indicators).length === 0) {
    return <div className="flex items-center justify-center h-64 text-slate-500">
      Indicator data unavailable
    </div>;
  }

  const {
    rsi, macd, macd_signal_line, macd_hist, 
    sma20, sma50, sma200, adx, atr, vwap
  } = indicators;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      <div className="bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F]">
         <p className="text-slate-500 text-xs mb-1">RSI (14)</p>
         <p className="text-xl font-mono text-slate-200">{rsi?.toFixed(2) ?? '-'}</p>
      </div>
      <div className="bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F]">
         <p className="text-slate-500 text-xs mb-1">MACD</p>
         <p className="text-xl font-mono text-slate-200">{macd?.toFixed(2) ?? '-'}</p>
      </div>
      <div className="bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F]">
         <p className="text-slate-500 text-xs mb-1">SMA (20)</p>
         <p className="text-xl font-mono text-slate-200">₹{sma20?.toFixed(2) ?? '-'}</p>
      </div>
      <div className="bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F]">
         <p className="text-slate-500 text-xs mb-1">SMA (50)</p>
         <p className="text-xl font-mono text-slate-200">₹{sma50?.toFixed(2) ?? '-'}</p>
      </div>
      <div className="bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F]">
         <p className="text-slate-500 text-xs mb-1">ADX (14)</p>
         <p className="text-xl font-mono text-slate-200">{adx?.toFixed(2) ?? '-'}</p>
      </div>
      <div className="bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F]">
         <p className="text-slate-500 text-xs mb-1">ATR</p>
         <p className="text-xl font-mono text-slate-200">{atr?.toFixed(2) ?? '-'}</p>
      </div>
      <div className="bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F]">
         <p className="text-slate-500 text-xs mb-1">VWAP</p>
         <p className="text-xl font-mono text-slate-200">₹{vwap?.toFixed(2) ?? '-'}</p>
      </div>
      <div className="bg-[#141D35] p-4 rounded-xl border border-[#1E2D4F]">
         <p className="text-slate-500 text-xs mb-1">SMA (200)</p>
         <p className="text-xl font-mono text-slate-200">₹{sma200?.toFixed(2) ?? '-'}</p>
      </div>
    </div>
  );
}
