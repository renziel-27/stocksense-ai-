import { format } from 'date-fns';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function HistoryTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
        <p>No historical predictions found.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50 border-b border-white/5 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <th className="px-6 py-5">Symbol</th>
              <th className="px-6 py-5">Date</th>
              <th className="px-6 py-5">Predicted (₹)</th>
              <th className="px-6 py-5">Actual (₹)</th>
              <th className="px-6 py-5">Error %</th>
              <th className="px-6 py-5">Trend</th>
              <th className="px-6 py-5">Verdict</th>
              <th className="px-6 py-5">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {data.map((row) => (
              <tr key={row._id} className="hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 font-bold text-white">{row.stockSymbol}</td>
                <td className="px-6 py-4 text-slate-300">
                  {format(new Date(row.timestamp), 'MMM dd, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 text-violet-400 font-medium">
                  {row.predictedPrice?.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-emerald-400 font-medium">
                  {row.actualPrice ? row.actualPrice.toFixed(2) : 'N/A'}
                </td>
                <td className="px-6 py-4 text-amber-400 text-sm">
                  {row.errorRate ? row.errorRate.toFixed(2) + '%' : 'N/A'}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    row?.trend === 'Bullish' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {row?.trend === 'Bullish' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {row?.trend ?? 'Neutral'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    (row?.recommendation?.verdict || 'HOLD') === 'BUY' ? 'text-emerald-400 bg-emerald-900/30 border-emerald-500/30' :
                    (row?.recommendation?.verdict || 'HOLD') === 'SELL' ? 'text-red-400 bg-red-900/30 border-red-500/30' :
                    'text-yellow-400 bg-yellow-900/30 border-yellow-500/30'
                  }`}>
                    {row?.recommendation?.verdict || 'HOLD'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${row.confidence > 80 ? 'bg-emerald-500' : row.confidence > 60 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{ width: `${row.confidence || 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{row.confidence?.toFixed(0)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
