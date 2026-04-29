import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';

export default function StockChart({ data }) {
  if (!data || data.length === 0) return null;

  const formattedData = data.map(item => ({
    ...item,
    formattedDate: format(new Date(item.Date), 'MMM dd, yyyy'),
    Close: Number(item.Close?.toFixed(2)),
    Predicted: item.Predicted ? Number(item.Predicted.toFixed(2)) : null
  }));

  const minPrice = Math.min(
    ...formattedData.map(d => d.Close || Infinity),
    ...formattedData.map(d => d.Predicted || Infinity)
  );
  
  const maxPrice = Math.max(
    ...formattedData.map(d => d.Close || -Infinity),
    ...formattedData.map(d => d.Predicted || -Infinity)
  );

  const domain = [
    Math.max(0, Math.floor(minPrice * 0.95)), 
    Math.ceil(maxPrice * 1.05)
  ];

  return (
    <div className="glass-card rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6 tracking-wide">Price History & Prediction Vector</h3>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              domain={domain} 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Area 
              type="monotone" 
              dataKey="Close" 
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorClose)" 
              name="Historical Close"
            />
            <Area 
              type="monotone" 
              dataKey="Predicted" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPredicted)" 
              name="Predicted Price"
              connectNulls={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
