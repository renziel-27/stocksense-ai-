import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell
} from 'recharts';
import {
  TrendingUp, TrendingDown, Eye, Trash2,
  Download, LayoutGrid, List, RefreshCw,
  ChevronDown, ChevronUp, Search, ClipboardList,
  BarChart2
} from 'lucide-react';
import { ALL_STOCKS } from '../data/stockUniverse';

const DEMO_HISTORY = [
  { id:'1', stockSymbol:'RELIANCE.NS',
    timestamp: new Date(Date.now()-3600000).toISOString(),
    currentPrice:1432.50, predictedPrice:1461.20,
    predictedChangePct:2.01, actualPrice:1448.00,
    errorRate:0.90, trend:'Bullish', confidence:84.2,
    recommendation:{ verdict:'BUY', final_score:72 },
    modelMetrics:{ mape:0.90, r_squared:0.91, training_samples:480 },
    patternsDetected:['Ascending Triangle','Bull Flag'],
    aiSummary:'RELIANCE shows bullish momentum with MACD crossover.' },

  { id:'2', stockSymbol:'TCS.NS',
    timestamp: new Date(Date.now()-86400000).toISOString(),
    currentPrice:3850.00, predictedPrice:3801.50,
    predictedChangePct:-1.26, actualPrice:3820.00,
    errorRate:1.84, trend:'Bearish', confidence:71.5,
    recommendation:{ verdict:'HOLD', final_score:58 },
    modelMetrics:{ mape:1.84, r_squared:0.87, training_samples:490 },
    patternsDetected:['Double Top'],
    aiSummary:'TCS near resistance. Mixed signals suggest holding.' },

  { id:'3', stockSymbol:'INFY.NS',
    timestamp: new Date(Date.now()-172800000).toISOString(),
    currentPrice:1748.30, predictedPrice:1792.10,
    predictedChangePct:2.51, actualPrice:null,
    errorRate:null, trend:'Bullish', confidence:78.9,
    recommendation:{ verdict:'BUY', final_score:69 },
    modelMetrics:{ mape:2.10, r_squared:0.85, training_samples:488 },
    patternsDetected:['Cup and Handle'],
    aiSummary:'INFY showing breakout pattern with strong volume.' },

  { id:'4', stockSymbol:'HDFCBANK.NS',
    timestamp: new Date(Date.now()-259200000).toISOString(),
    currentPrice:1692.00, predictedPrice:1648.30,
    predictedChangePct:-2.58, actualPrice:1661.00,
    errorRate:1.52, trend:'Bearish', confidence:65.4,
    recommendation:{ verdict:'SELL', final_score:41 },
    modelMetrics:{ mape:1.52, r_squared:0.82, training_samples:475 },
    patternsDetected:['Head and Shoulders'],
    aiSummary:'HDFCBANK forming reversal pattern. Caution advised.' },

  { id:'5', stockSymbol:'SBIN.NS',
    timestamp: new Date(Date.now()-345600000).toISOString(),
    currentPrice:812.40, predictedPrice:838.50,
    predictedChangePct:3.21, actualPrice:829.00,
    errorRate:0.71, trend:'Bullish', confidence:88.1,
    recommendation:{ verdict:'BUY', final_score:76 },
    modelMetrics:{ mape:0.71, r_squared:0.94, training_samples:492 },
    patternsDetected:['Double Bottom','Ascending Triangle'],
    aiSummary:'SBIN showing strong bullish reversal from support.' },

  { id:'6', stockSymbol:'BAJFINANCE.NS',
    timestamp: new Date(Date.now()-432000000).toISOString(),
    currentPrice:6840.00, predictedPrice:6920.30,
    predictedChangePct:1.17, actualPrice:6895.00,
    errorRate:0.36, trend:'Bullish', confidence:91.3,
    recommendation:{ verdict:'BUY', final_score:81 },
    modelMetrics:{ mape:0.36, r_squared:0.96, training_samples:495 },
    patternsDetected:['Bull Flag'],
    aiSummary:'BAJFINANCE consolidating before next leg up.' },
];

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff/60000);
  const h = Math.floor(diff/3600000);
  const d = Math.floor(diff/86400000);
  if (m<1)  return 'just now';
  if (m<60) return `${m}m ago`;
  if (h<24) return `${h}h ago`;
  return `${d}d ago`;
}

function formatPrice(p) {
  if (p==null) return '—';
  return '₹' + p.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2});
}

function getStockInfo(symbol) {
  return ALL_STOCKS.find(s=>s.symbol===symbol) || {symbol, name:symbol, sector:'Unknown'};
}

function exportCSV(data) {
  const headers = [
    'Symbol','Date','Predicted Price','Actual Price',
    'Error %','Trend','Confidence','Verdict','Score',
    'MAPE','R Squared','Patterns'
  ];
  const rows = data.map(p => [
    p.stockSymbol,
    new Date(p.timestamp).toLocaleString('en-IN'),
    p.predictedPrice,
    p.actualPrice ?? 'Pending',
    p.errorRate?.toFixed(2) ?? '—',
    p.trend,
    p.confidence?.toFixed(1),
    p.recommendation?.verdict ?? '—',
    p.recommendation?.final_score ?? '—',
    p.modelMetrics?.mape?.toFixed(2) ?? '—',
    p.modelMetrics?.r_squared?.toFixed(3) ?? '—',
    (p.patternsDetected||[]).join('; '),
  ]);
  const csv = [headers, ...rows]
    .map(r => `"${r.join('","')}"`)
    .join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `stocksense_history_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendFilter, setTrendFilter] = useState('All');
  const [verdictFilter, setVerdictFilter] = useState('All');
  const [sortKey, setSortKey] = useState('Newest First');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [chartTab, setChartTab] = useState('Accuracy Trend');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/history?limit=50');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setHistory(data);
          } else {
            setHistory(DEMO_HISTORY);
          }
        } else {
          setHistory(DEMO_HISTORY);
        }
      } catch {
        setHistory(DEMO_HISTORY);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter(p => {
      if (searchQuery && !p.stockSymbol.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (trendFilter !== 'All' && p.trend !== trendFilter) return false;
      if (verdictFilter !== 'All' && p.recommendation?.verdict !== verdictFilter) return false;
      if (dateFrom && new Date(p.timestamp) < new Date(dateFrom)) return false;
      if (dateTo && new Date(p.timestamp) > new Date(dateTo)) return false;
      return true;
    }).sort((a, b) => {
      if (sortKey === 'Newest First') return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortKey === 'Oldest First') return new Date(a.timestamp) - new Date(b.timestamp);
      if (sortKey === 'Highest Confidence') return (b.confidence || 0) - (a.confidence || 0);
      if (sortKey === 'Lowest Error') {
        const ea = a.errorRate ?? 999;
        const eb = b.errorRate ?? 999;
        return ea - eb;
      }
      return 0;
    });
  }, [history, searchQuery, trendFilter, verdictFilter, sortKey, dateFrom, dateTo]);

  const stats = useMemo(() => {
    if (history.length === 0) return { total: 0, avgAcc: 0, bullishPct: 0, avgConf: 0 };
    const withError = history.filter(h => h.errorRate != null);
    const avgAcc = withError.length > 0 ? 100 - (withError.reduce((sum, h) => sum + h.errorRate, 0) / withError.length) : 0;
    const bullishPct = (history.filter(h => h.trend === 'Bullish').length / history.length) * 100;
    const avgConf = history.reduce((sum, h) => sum + (h.confidence || 0), 0) / history.length;
    return {
      total: history.length,
      avgAcc: avgAcc.toFixed(1),
      bullishPct: bullishPct.toFixed(1),
      avgConf: avgConf.toFixed(1)
    };
  }, [history]);

  const scorecard = useMemo(() => {
    const withActual = history.filter(h => h.actualPrice != null && h.errorRate != null);
    if (withActual.length < 3) return null;
    
    const avgAcc = 100 - (withActual.reduce((sum, h) => sum + h.errorRate, 0) / withActual.length);
    let dirCorrect = 0;
    withActual.forEach(h => {
      const actChange = h.actualPrice - h.currentPrice;
      if (h.trend === 'Bullish' && actChange > 0) dirCorrect++;
      else if (h.trend === 'Bearish' && actChange < 0) dirCorrect++;
    });
    const dirAcc = (dirCorrect / withActual.length) * 100;

    const sortedByError = [...withActual].sort((a,b) => a.errorRate - b.errorRate);
    const best = sortedByError[0];
    const worst = sortedByError[sortedByError.length - 1];

    return { avgAcc: avgAcc.toFixed(1), dirAcc: dirAcc.toFixed(1), best, worst };
  }, [history]);

  const mostAnalyzed = useMemo(() => {
    const counts = {};
    history.forEach(h => {
      if(!counts[h.stockSymbol]) counts[h.stockSymbol] = { count: 0, sumErr: 0, errCount: 0 };
      counts[h.stockSymbol].count++;
      if (h.errorRate != null) {
        counts[h.stockSymbol].sumErr += h.errorRate;
        counts[h.stockSymbol].errCount++;
      }
    });
    const arr = Object.keys(counts).map(sym => {
      const c = counts[sym];
      const avgAcc = c.errCount > 0 ? 100 - (c.sumErr / c.errCount) : null;
      return { symbol: sym, count: c.count, avgAcc };
    }).sort((a,b) => b.count - a.count).slice(0, 5);
    const maxCount = arr.length > 0 ? arr[0].count : 1;
    return { list: arr, maxCount };
  }, [history]);

  const accuracyChartData = useMemo(() => {
    return filteredHistory.filter(h => h.errorRate != null)
      .map(h => ({
        date: new Date(h.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        accuracy: +(100 - h.errorRate).toFixed(2)
      })).reverse();
  }, [filteredHistory]);

  const pnlChartData = useMemo(() => {
    return filteredHistory.filter(h => h.actualPrice != null)
      .map((h, i) => {
        const actChange = h.actualPrice - h.currentPrice;
        const pnl = h.recommendation?.verdict === 'SELL' ? -actChange : actChange;
        return {
          name: `${h.stockSymbol.replace('.NS','')} ${i}`,
          pnl: +pnl.toFixed(2),
          symbol: h.stockSymbol.replace('.NS','')
        };
      });
  }, [filteredHistory]);

  const confidenceChartData = useMemo(() => {
    return filteredHistory.map((h, i) => ({
      name: `${h.stockSymbol.replace('.NS','')} ${i}`,
      symbol: h.stockSymbol.replace('.NS',''),
      confidence: h.confidence || 0
    })).reverse();
  }, [filteredHistory]);

  const handleDelete = (id) => {
    if (window.confirm('Delete this prediction from history?')) {
      setHistory(history.filter(h => h.id !== id));
    }
  };

  const getVerdictBadge = (v) => {
    if (v === 'BUY') return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-900/50 text-emerald-400">BUY</span>;
    if (v === 'SELL') return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-900/50 text-red-400">SELL</span>;
    return <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-900/50 text-yellow-400">HOLD</span>;
  };

  if (loading) {
    return <div className="bg-[#0A0E1A] min-h-screen p-6 flex items-center justify-center text-slate-400">Loading history...</div>;
  }

  return (
    <div className="bg-[#0A0E1A] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION 1 — Page Header + Summary Stats */}
        <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6 mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-blue-500" /> Prediction History
            </h1>
            <p className="text-slate-400 text-sm mt-1">Your LSTM prediction track record</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="bg-[#141D35] border border-[#1E2D4F] px-4 py-2 rounded-xl text-center">
              <div className="text-xl font-bold text-slate-100 font-mono">{stats.total}</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Predictions</div>
            </div>
            <div className="bg-[#141D35] border border-[#1E2D4F] px-4 py-2 rounded-xl text-center">
              <div className="text-xl font-bold text-emerald-400 font-mono">{stats.avgAcc}%</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Avg Accuracy</div>
            </div>
            <div className="bg-[#141D35] border border-[#1E2D4F] px-4 py-2 rounded-xl text-center">
              <div className="text-xl font-bold text-blue-400 font-mono">{stats.bullishPct}%</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Bullish Bias</div>
            </div>
            <div className="bg-[#141D35] border border-[#1E2D4F] px-4 py-2 rounded-xl text-center">
              <div className="text-xl font-bold text-slate-200 font-mono">{stats.avgConf}%</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Avg Confidence</div>
            </div>
          </div>
        </div>

        {/* SECTION 2 — Filters + Search Bar */}
        <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search symbol..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#141D35] border border-[#1E2D4F] rounded-xl pl-9 pr-3 py-2 w-48 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
            
            <div className="flex bg-[#141D35] border border-[#1E2D4F] rounded-xl p-1">
              {['All', 'Bullish', 'Bearish'].map(f => (
                <button key={f} onClick={() => setTrendFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${trendFilter === f ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                  {f}
                </button>
              ))}
            </div>

            <div className="flex bg-[#141D35] border border-[#1E2D4F] rounded-xl p-1">
              {['All', 'BUY', 'HOLD', 'SELL'].map(f => (
                <button key={f} onClick={() => setVerdictFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${verdictFilter === f ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                  {f}
                </button>
              ))}
            </div>

            <select 
              value={sortKey} 
              onChange={e => setSortKey(e.target.value)}
              className="bg-[#141D35] border border-[#1E2D4F] rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 appearance-none"
            >
              <option value="Newest First">Newest First</option>
              <option value="Oldest First">Oldest First</option>
              <option value="Highest Confidence">Highest Confidence</option>
              <option value="Lowest Error">Lowest Error</option>
            </select>

            <div className="flex items-center gap-2">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-[#141D35] border border-[#1E2D4F] rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-blue-500" />
              <span className="text-slate-500 text-xs">to</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-[#141D35] border border-[#1E2D4F] rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          
          <button 
            onClick={() => exportCSV(filteredHistory)}
            className="flex items-center gap-2 bg-[#141D35] border border-[#1E2D4F] hover:border-blue-500/50 text-slate-400 hover:text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          
          {/* SECTION 3 — Performance Chart */}
          <div className="xl:col-span-2 bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex bg-[#141D35] border border-[#1E2D4F] rounded-xl p-1">
                {['Accuracy Trend', 'P&L Simulation', 'Confidence'].map(tab => (
                  <button key={tab} onClick={() => setChartTab(tab)} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${chartTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartTab === 'Accuracy Trend' ? (
                  <LineChart data={accuracyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4F" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#1E2D4F' }} />
                    <YAxis domain={['auto', 100]} tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#1E2D4F' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F1629', borderColor: '#1E2D4F', color: '#E2E8F0', borderRadius: '8px' }} />
                    <ReferenceLine y={95} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: "95% Target", fill: "#F59E0B", fontSize: 10, position: "insideBottomLeft" }} />
                    <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} />
                  </LineChart>
                ) : chartTab === 'P&L Simulation' ? (
                  <BarChart data={pnlChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4F" vertical={false} />
                    <XAxis dataKey="symbol" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#1E2D4F' }} />
                    <YAxis tickFormatter={v => `₹${v}`} tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#1E2D4F' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F1629', borderColor: '#1E2D4F', color: '#E2E8F0', borderRadius: '8px' }} formatter={v => `₹${v}`} />
                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                      {pnlChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart data={confidenceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4F" vertical={false} />
                    <XAxis dataKey="symbol" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#1E2D4F' }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#1E2D4F' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F1629', borderColor: '#1E2D4F', color: '#E2E8F0', borderRadius: '8px' }} />
                    <Bar dataKey="confidence" radius={[4, 4, 0, 0]}>
                      {confidenceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.confidence > 80 ? '#10B981' : entry.confidence > 60 ? '#F59E0B' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* SECTION 6 — Most Analyzed Stocks */}
          <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6 flex flex-col">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-6">
              🏆 Most Analyzed Stocks
            </h2>
            <div className="flex-1 flex flex-col justify-between">
              {mostAnalyzed.list.map((m, i) => (
                <div key={m.symbol} className="flex items-center justify-between mb-4 last:mb-0">
                  <div className="w-24 flex-shrink-0">
                    <div className="text-sm font-bold font-mono text-slate-200 truncate">{m.symbol.replace('.NS','')}</div>
                  </div>
                  <div className="flex-1 mx-4 h-3 bg-[#141D35] rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{width: `${(m.count / mostAnalyzed.maxCount) * 100}%`}}></div>
                  </div>
                  <div className="w-16 text-right">
                    <div className="text-xs font-bold text-slate-300">{m.count}x</div>
                    {m.avgAcc != null && <div className="text-[10px] text-slate-500 font-mono">{m.avgAcc.toFixed(1)}% acc</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 5 — Accuracy Scorecard */}
        {scorecard && (
          <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">📊 Model Accuracy Scorecard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#141D35] border border-[#1E2D4F] rounded-xl p-4">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Overall Accuracy</div>
                <div className={`text-3xl font-mono font-bold ${parseFloat(scorecard.avgAcc) > 95 ? 'text-emerald-400' : parseFloat(scorecard.avgAcc) > 90 ? 'text-yellow-400' : 'text-red-400'}`}>{scorecard.avgAcc}%</div>
                <div className="text-xs text-slate-400 mt-2">Average across all predictions</div>
              </div>
              <div className="bg-[#141D35] border border-[#1E2D4F] rounded-xl p-4">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Direction Accuracy</div>
                <div className="text-3xl font-mono font-bold text-blue-400">{scorecard.dirAcc}%</div>
                <div className="text-xs text-slate-400 mt-2">Correct trend predictions</div>
              </div>
              <div className="bg-[#141D35] border border-[#1E2D4F] rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-900/40 text-emerald-400 text-[10px] px-2 py-1 rounded-bl-lg font-bold">⭐ Best</div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Best Prediction</div>
                <div className="text-xl font-mono font-bold text-slate-200">{scorecard.best.stockSymbol.replace('.NS','')}</div>
                <div className="text-sm font-mono text-emerald-400 font-bold">{scorecard.best.errorRate.toFixed(2)}% Error</div>
                <div className="text-xs text-slate-400 mt-1">Lowest error rate</div>
              </div>
              <div className="bg-[#141D35] border border-[#1E2D4F] rounded-xl p-4">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Worst Prediction</div>
                <div className="text-xl font-mono font-bold text-slate-200">{scorecard.worst.stockSymbol.replace('.NS','')}</div>
                <div className="text-sm font-mono text-red-400 font-bold">{scorecard.worst.errorRate.toFixed(2)}% Error</div>
                <div className="text-xs text-slate-400 mt-1">Needs improvement</div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4 — Prediction Cards Grid / Table */}
        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-xl font-bold text-slate-100">Saved Predictions ({filteredHistory.length})</h2>
          <div className="flex bg-[#0F1629] border border-[#1E2D4F] rounded-xl p-1">
            <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-lg ${viewMode === 'card' ? 'bg-[#141D35] text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-[#141D35] text-slate-200' : 'text-slate-500 hover:text-slate-300'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <ClipboardList className="w-16 h-16 text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">No predictions found</h3>
            <p className="text-slate-500 max-w-md mb-6">Run your first analysis on the Dashboard or adjust your search filters.</p>
            <Link to="/" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
              Go to Dashboard
            </Link>
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-12">
            {filteredHistory.map(p => {
              const isExpanded = expandedCardId === p.id;
              const info = getStockInfo(p.stockSymbol);
              const isBullish = p.trend === 'Bullish';
              return (
                <div 
                  key={p.id} 
                  onClick={() => setExpandedCardId(isExpanded ? null : p.id)}
                  className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-5 hover:border-blue-500/30 transition-all cursor-pointer flex flex-col"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="font-mono font-bold text-lg text-slate-100">{p.stockSymbol.replace('.NS','')}</div>
                      <div className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full inline-block uppercase font-bold mt-1">{info.sector}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getVerdictBadge(p.recommendation?.verdict)}
                      <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isBullish ? 'bg-emerald-900/20 text-emerald-400' : 'bg-red-900/20 text-red-400'}`}>
                        {p.trend}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 bg-[#141D35] rounded-xl p-3">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Predicted</div>
                      <div className={`font-mono text-sm font-bold ${isBullish ? 'text-emerald-400' : 'text-red-400'}`}>{formatPrice(p.predictedPrice)}</div>
                      <div className={`text-[10px] ${isBullish ? 'text-emerald-500' : 'text-red-500'}`}>{p.predictedChangePct > 0 ? '+' : ''}{p.predictedChangePct}%</div>
                    </div>
                    <div className="border-l border-[#1E2D4F] pl-3">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Actual</div>
                      <div className={`font-mono text-sm font-bold ${p.actualPrice ? 'text-slate-200' : 'text-slate-500'}`}>{p.actualPrice ? formatPrice(p.actualPrice) : 'Pending'}</div>
                    </div>
                    <div className="border-l border-[#1E2D4F] pl-3">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Error</div>
                      <div className={`font-mono text-sm font-bold ${p.errorRate != null ? (p.errorRate < 2 ? 'text-emerald-400' : p.errorRate < 5 ? 'text-yellow-400' : 'text-red-400') : 'text-slate-500'}`}>
                        {p.errorRate != null ? `${p.errorRate.toFixed(2)}%` : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mt-auto">
                    <div className="w-1/2">
                      <div className="text-[10px] text-slate-500 mb-1">Confidence {p.confidence?.toFixed(1)}%</div>
                      <div className="h-1.5 w-full bg-[#141D35] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${p.confidence > 80 ? 'bg-emerald-500' : p.confidence > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${p.confidence || 0}%`}}></div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">{timeAgo(p.timestamp)}</div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[#1E2D4F] space-y-4 cursor-default" onClick={e => e.stopPropagation()}>
                      <div>
                        <div className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-wider">Model Metrics</div>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-[#141D35] px-2 py-1 rounded text-xs text-slate-300 font-mono">MAPE: {p.modelMetrics?.mape?.toFixed(2)}</span>
                          <span className="bg-[#141D35] px-2 py-1 rounded text-xs text-slate-300 font-mono">R²: {p.modelMetrics?.r_squared?.toFixed(2)}</span>
                          <span className="bg-[#141D35] px-2 py-1 rounded text-xs text-slate-300 font-mono">Samples: {p.modelMetrics?.training_samples}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-wider">Patterns Detected</div>
                        <div className="flex flex-wrap gap-2">
                          {p.patternsDetected?.length > 0 ? (
                            p.patternsDetected.map(pat => <span key={pat} className="bg-blue-900/40 text-blue-400 text-xs px-2 py-0.5 rounded-full">{pat}</span>)
                          ) : (
                            <span className="text-xs text-slate-500">No patterns detected</span>
                          )}
                        </div>
                      </div>

                      <div className="text-sm text-slate-400 italic leading-relaxed border-l-2 border-blue-500 pl-3">
                        "{p.aiSummary}"
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button onClick={() => navigate(`/?symbol=${p.stockSymbol}`)} className="flex-1 flex items-center justify-center gap-2 bg-[#141D35] hover:bg-blue-600 border border-[#1E2D4F] hover:border-blue-500 text-slate-300 hover:text-white py-2 rounded-xl text-xs font-bold transition-colors">
                          <RefreshCw className="w-3.5 h-3.5" /> Re-analyze
                        </button>
                        <button onClick={() => navigate(`/?symbol=${p.stockSymbol}`)} className="flex-1 flex items-center justify-center gap-2 bg-[#141D35] hover:bg-[#1E2D4F] border border-[#1E2D4F] text-slate-300 py-2 rounded-xl text-xs font-bold transition-colors">
                          <BarChart2 className="w-3.5 h-3.5" /> View Chart
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="flex items-center justify-center p-2 bg-[#141D35] hover:bg-red-900/50 border border-[#1E2D4F] hover:border-red-500/50 text-slate-400 hover:text-red-400 rounded-xl transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl overflow-x-auto pb-12">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-[#141D35] text-xs uppercase text-slate-500 font-semibold border-b border-[#1E2D4F] sticky top-0">
                <tr>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Predicted</th>
                  <th className="px-4 py-3">Actual</th>
                  <th className="px-4 py-3">Error%</th>
                  <th className="px-4 py-3">Trend</th>
                  <th className="px-4 py-3">Conf.</th>
                  <th className="px-4 py-3">Verdict</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Patterns</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2D4F]/50">
                {filteredHistory.map(p => {
                  const isBullish = p.trend === 'Bullish';
                  return (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-200">{p.stockSymbol.replace('.NS','')}</td>
                      <td className="px-4 py-3">{new Date(p.timestamp).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}</td>
                      <td className={`px-4 py-3 font-mono ${isBullish ? 'text-emerald-400' : 'text-red-400'}`}>{formatPrice(p.predictedPrice)}</td>
                      <td className={`px-4 py-3 font-mono ${p.actualPrice ? 'text-slate-300' : 'text-slate-500'}`}>{p.actualPrice ? formatPrice(p.actualPrice) : 'Pending'}</td>
                      <td className={`px-4 py-3 font-mono font-bold ${p.errorRate != null ? (p.errorRate < 2 ? 'text-emerald-400' : p.errorRate < 5 ? 'text-yellow-400' : 'text-red-400') : 'text-slate-500'}`}>
                        {p.errorRate != null ? `${p.errorRate.toFixed(2)}%` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isBullish ? 'bg-emerald-900/20 text-emerald-400' : 'bg-red-900/20 text-red-400'}`}>{p.trend}</span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${p.confidence > 80 ? 'bg-emerald-500' : p.confidence > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                          {p.confidence?.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-4 py-3">{getVerdictBadge(p.recommendation?.verdict)}</td>
                      <td className="px-4 py-3 font-mono">{p.recommendation?.final_score || '—'}/100</td>
                      <td className="px-4 py-3 truncate max-w-[120px]">
                        {p.patternsDetected?.length > 0 ? `${p.patternsDetected[0]}${p.patternsDetected.length > 1 ? ' +'+(p.patternsDetected.length-1) : ''}` : 'None'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => navigate(`/?symbol=${p.stockSymbol}`)} className="p-1.5 hover:bg-[#141D35] rounded-lg text-slate-400 hover:text-blue-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
