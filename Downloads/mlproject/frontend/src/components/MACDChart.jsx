import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function MACDChart({
  macd = [], signal = [], hist = [], dates = []
}) {
  if (!macd || macd.length === 0) {
    return <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
             MACD data unavailable
           </div>;
  }
  const data = macd.map((v, i) => ({
    date:   dates[i] || i,
    macd:   v ?? 0,
    signal: signal[i] ?? 0,
    hist:   hist[i] ?? 0,
    color:  (hist[i] ?? 0) >= 0 ? '#10B981' : '#EF4444'
  }));

  return (
    <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4F" />
            <XAxis dataKey="date" hide />
            <YAxis tick={{ fill: '#64748B', fontSize: 10 }} width={30} />
            <Tooltip contentStyle={{ background:'#0F1629', border:'1px solid #1E2D4F', color:'#fff', fontSize: '12px' }} />
            <Bar dataKey="hist" fill="#3B82F6" radius={[2, 2, 0, 0]} />
            <Line type="monotone" dataKey="macd" stroke="#3B82F6" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="signal" stroke="#F59E0B" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
    </div>
  );
}
