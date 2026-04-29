import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function BollingerChart({
  data = [], upper = [], lower = [], mid = []
}) {
  if (!data || data.length === 0) return null;
  const chartData = data.map((row, i) => ({
    date:  row.date,
    close: row.close,
    upper: upper[i] ?? null,
    lower: lower[i] ?? null,
    mid:   mid[i]   ?? null,
    // Add a helper array to render the banded area
    band: [lower[i] ?? null, upper[i] ?? null]
  })).filter(row => row.close != null);

  const minPrice = Math.min(...chartData.map(d => d.lower || d.close)) * 0.95;
  const maxPrice = Math.max(...chartData.map(d => d.upper || d.close)) * 1.05;

  return (
    <div className="w-full h-40">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4F" />
            <XAxis dataKey="date" hide />
            <YAxis domain={[minPrice, maxPrice]} tick={{ fill: '#64748B', fontSize: 10 }} width={40} />
            <Tooltip contentStyle={{ background:'#0F1629', border:'1px solid #1E2D4F', color:'#fff', fontSize: '12px' }} />
            
            <Area type="monotone" dataKey="band" fill="#3B82F6" fillOpacity={0.1} stroke="none" />
            <Line type="monotone" dataKey="upper" stroke="#3B82F6" strokeWidth={1} strokeOpacity={0.5} dot={false} />
            <Line type="monotone" dataKey="lower" stroke="#3B82F6" strokeWidth={1} strokeOpacity={0.5} dot={false} />
            <Line type="monotone" dataKey="mid" stroke="#F59E0B" strokeWidth={1} strokeDasharray="3 3" dot={false} />
            <Line type="monotone" dataKey="close" stroke="#fff" strokeWidth={1.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
    </div>
  );
}
