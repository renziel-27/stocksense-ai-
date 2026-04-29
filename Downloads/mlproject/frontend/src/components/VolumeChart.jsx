import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function VolumeChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div className="h-32 flex items-center justify-center
                           text-slate-500 text-sm">
             Volume data unavailable
           </div>;
  }

  const chartData = data.map(row => ({
    date:   row.date,
    volume: row.volume,
    color:  row.close >= row.open ? '#10B981' : '#EF4444',
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4F"/>
        <XAxis dataKey="date" tick={{ fill:'#64748B', fontSize:10 }}
               tickLine={false} axisLine={false}
               interval={Math.floor(chartData.length / 6)}/>
        <YAxis tick={{ fill:'#64748B', fontSize:10 }}
               tickLine={false} axisLine={false}
               tickFormatter={v =>
                 v >= 1e7 ? `${(v/1e7).toFixed(1)}Cr` :
                 v >= 1e5 ? `${(v/1e5).toFixed(1)}L` : v
               }/>
        <Tooltip
          contentStyle={{ background:'#0F1629',
                          border:'1px solid #1E2D4F',
                          color:'#E2E8F0', fontSize:12 }}
          formatter={(v) => [
            v >= 1e7 ? `${(v/1e7).toFixed(2)} Cr` :
            v >= 1e5 ? `${(v/1e5).toFixed(2)} L` : v,
            'Volume'
          ]}
        />
        <Bar dataKey="volume"
             fill="#3B82F6"
             opacity={0.7}
             radius={[2,2,0,0]}/>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
