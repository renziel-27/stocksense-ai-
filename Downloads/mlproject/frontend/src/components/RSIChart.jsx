import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, ReferenceLine,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function RSIChart({ series = [], dates = [] }) {
  if (!series || series.length === 0) {
    return <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
             RSI data unavailable
           </div>;
  }
  const data = series.map((v, i) => ({
    date: dates[i] || i,
    rsi:  v ?? 50
  }));

  return (
    <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4F" />
            <XAxis dataKey="date" hide />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} width={30} />
            <Tooltip contentStyle={{ background:'#0F1629', border:'1px solid #1E2D4F', color:'#fff', fontSize: '12px' }} />
            <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.6} />
            <ReferenceLine y={30} stroke="#10B981" strokeDasharray="3 3" strokeOpacity={0.6} />
            <Line type="monotone" dataKey="rsi" stroke="#A855F7" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
    </div>
  );
}
