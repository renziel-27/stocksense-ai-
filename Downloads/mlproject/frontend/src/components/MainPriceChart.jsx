import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

export default function MainPriceChart({ data = [], overlay = [], showOverlay = false, indicators = {}, metrics = {} }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No chart data available
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = data.map((row, i) => ({
    date:      row.date,
    close:     row.close,
    open:      row.open,
    high:      row.high,
    low:       row.low,
    volume:    row.volume,
    predicted: overlay[i]?.predicted ?? undefined,
    sma20:     indicators.sma20_series?.[i] ?? undefined,
    sma50:     indicators.sma50_series?.[i] ?? undefined,
  }));

  const minPrice = Math.min(...chartData.map(d => d.close)) * 0.95;
  const maxPrice = Math.max(...chartData.map(d => d.close)) * 1.05;

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4F" vertical={false} />
          <XAxis dataKey="date" tick={{ fill:'#64748B', fontSize: 12 }} interval="preserveStartEnd" minTickGap={30} axisLine={false} tickLine={false} />
          <YAxis domain={[minPrice, maxPrice]} tick={{ fill:'#64748B', fontSize: 12 }} orientation="right" axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val.toFixed(0)}`} />
          <Tooltip contentStyle={{ background:'#0F1629', border:'1px solid #1E2D4F', borderRadius:'8px', color:'#fff' }} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          <Area type="monotone" dataKey="close" name="Actual Price" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorClose)" />
          
          {indicators.sma20_series && !showOverlay && (
            <Line type="monotone" dataKey="sma20" name="SMA 20" stroke="#F59E0B" strokeWidth={1} dot={false} strokeDasharray="5 5" />
          )}

          {showOverlay && overlay.length > 0 && (
            <Area type="monotone" dataKey="predicted" name="LSTM Prediction" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorPredicted)" />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
