import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

export default function IndicatorsChart({ data, type }) {
  if (!data || data.length === 0) return null;

  // Simple SMA calculator for visualization
  const calculateSMA = (data, window) => {
    let result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < window - 1) {
        result.push(null);
      } else {
        let sum = 0;
        for (let j = 0; j < window; j++) {
          sum += data[i - j].Close;
        }
        result.push(sum / window);
      }
    }
    return result;
  };

  // Simple RSI calculator for visualization
  const calculateRSI = (data, window = 14) => {
    let result = [];
    let gains = [];
    let losses = [];
    
    for (let i = 1; i < data.length; i++) {
      let diff = data[i].Close - data[i-1].Close;
      gains.push(Math.max(diff, 0));
      losses.push(Math.max(-diff, 0));
    }
    
    // Fill first point
    result.push(null);
    
    for (let i = 1; i < data.length; i++) {
      if (i < window) {
        result.push(null);
      } else {
        let avgGain = gains.slice(i - window, i).reduce((a, b) => a + b, 0) / window;
        let avgLoss = losses.slice(i - window, i).reduce((a, b) => a + b, 0) / window;
        
        if (avgLoss === 0) {
          result.push(100);
        } else {
          let rs = avgGain / avgLoss;
          result.push(100 - (100 / (1 + rs)));
        }
      }
    }
    return result;
  };

  const sma20 = calculateSMA(data, 20);
  const sma50 = calculateSMA(data, 50);
  const rsiList = calculateRSI(data, 14);

  const formattedData = data.map((item, index) => ({
    ...item,
    formattedDate: format(new Date(item.Date), 'MMM dd, yyyy'),
    SMA20: sma20[index],
    SMA50: sma50[index],
    RSI: rsiList[index],
  })).slice(-90); // last 90 days for clarity

  return (
    <div className="glass-card rounded-2xl p-6 h-full">
      <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 mb-6 tracking-wide">
        {type === 'RSI' ? 'Relative Strength Index (RSI)' : 'Moving Averages (SMA20 vs SMA50)'}
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              minTickGap={20}
            />
            <YAxis 
              domain={type === 'RSI' ? [0, 100] : ['auto', 'auto']} 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={type === 'SMA' ? (value) => `₹${value}` : undefined}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            
            {type === 'RSI' ? (
              <>
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Overbought', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'insideBottomLeft', value: 'Oversold', fill: '#10b981', fontSize: 10 }} />
                <Line type="monotone" dataKey="RSI" stroke="#3b82f6" dot={false} strokeWidth={2} name="RSI (14)" connectNulls={true} />
              </>
            ) : (
              <>
                <Line type="monotone" dataKey="Close" stroke="#64748b" dot={false} strokeWidth={1} name="Close" strokeDasharray="4 4" connectNulls={true} />
                <Line type="monotone" dataKey="SMA20" stroke="#10b981" dot={false} strokeWidth={2} name="SMA (20)" connectNulls={true} />
                <Line type="monotone" dataKey="SMA50" stroke="#f59e0b" dot={false} strokeWidth={2} name="SMA (50)" connectNulls={true} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
