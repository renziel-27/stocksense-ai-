import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
  ResponsiveContainer
} from 'recharts';
import { Plus, X, TrendingUp, TrendingDown, Info, BarChart2 } from 'lucide-react';
import StockSearchBar from '../components/StockSearchBar';
import { ALL_STOCKS } from '../data/stockUniverse';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
const PERIOD_POINTS = { '1M': 22, '3M': 66, '6M': 132, '1Y': 252, '2Y': 504 };
const QUICK_ADDS = ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'SBIN.NS', 'BAJFINANCE.NS', 'TATAMOTORS.NS'];

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

function getStockInfo(symbol) {
  return ALL_STOCKS.find(s => s.symbol === symbol)
    || { symbol, name: symbol, sector: 'Unknown', category: 'Other' };
}

function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function symbolSeed(symbol) {
  return symbol.split('').reduce((a,c) => a + c.charCodeAt(0), 0);
}

function generatePrices(symbol, points) {
  const rng = seededRandom(symbolSeed(symbol));
  const basePrices = {
    'RELIANCE.NS':1432, 'TCS.NS':3850, 'INFY.NS':1748,
    'HDFCBANK.NS':1692, 'SBIN.NS':812,  'BAJFINANCE.NS':6840,
    'TATAMOTORS.NS':945, 'ADANIENT.NS':2340,
    'WIPRO.NS':480,     'ICICIBANK.NS':1240,
  };
  let p = basePrices[symbol] || (500 + rng()*2000);
  const prices = [p];
  for (let i = 1; i < points; i++) {
    const change = (rng() - 0.48) * 0.022;
    p = p * (1 + change);
    prices.push(Math.max(p, 1));
  }
  return prices;
}

function generateMetrics(symbol, period) {
  const points = PERIOD_POINTS[period] || 252;
  const rng = seededRandom(symbolSeed(symbol) * 7);
  const prices = generatePrices(symbol, points);
  const currentPrice = prices[prices.length - 1];
  const startPrice = prices[0];
  const prices52W = generatePrices(symbol, 252);
  
  return {
    symbol,
    currentPrice: Math.round(currentPrice * 100) / 100,
    periodReturn: ((currentPrice - startPrice) / startPrice * 100),
    high52w: Math.max(...prices52W),
    low52w:  Math.min(...prices52W),
    marketCap: Math.round(currentPrice * (rng()*50 + 10) * 100) / 100,
    pe: Math.round((15 + rng()*30) * 10) / 10,
    rsi: Math.round(30 + rng()*50),
    volatility: Math.round((10 + rng()*25) * 10) / 10,
    predictedPrice: Math.round(currentPrice * (1 + (rng() - 0.47)*0.03) * 100) / 100,
    signal: rng() > 0.6 ? 'BUY' : rng() > 0.3 ? 'HOLD' : 'SELL',
    radarScores: {
      Momentum:   Math.round(30 + rng()*70),
      Trend:      Math.round(30 + rng()*70),
      Value:      Math.round(30 + rng()*70),
      Volume:     Math.round(30 + rng()*70),
      Volatility: Math.round(30 + rng()*70),
      Quality:    Math.round(30 + rng()*70),
    }
  };
}

function correlation(sym1, sym2) {
  if (sym1 === sym2) return 1.0;
  const seed = symbolSeed(sym1 > sym2 ? sym1 + sym2 : sym2 + sym1);
  const rng = seededRandom(seed);
  return Math.round((0.3 + rng()*0.65) * 100) / 100;
}

const METRICS_CONFIG = [
  { label: 'Current Price', key: 'currentPrice', format: (v) => `₹${v.toLocaleString('en-IN', {minimumFractionDigits:2})}` },
  { label: 'Period Return', key: 'periodReturn', format: (v) => <span className={v>=0?'text-emerald-400':'text-red-400'}>{v>=0?'+':''}{v.toFixed(2)}%</span> },
  { label: '52W High', key: 'high52w', format: (v) => `₹${v.toLocaleString('en-IN', {minimumFractionDigits:2})}` },
  { label: '52W Low', key: 'low52w', format: (v) => `₹${v.toLocaleString('en-IN', {minimumFractionDigits:2})}` },
  { label: 'Market Cap', key: 'marketCap', format: (v) => v>1000 ? `₹${(v/100).toFixed(2)} Lakh Cr` : `₹${v.toLocaleString('en-IN')} Cr` },
  { label: 'P/E Ratio', key: 'pe', format: (v) => v.toFixed(1) },
  { label: 'Simulated RSI', key: 'rsi', format: (v) => {
      let badge = 'bg-slate-800 text-slate-400';
      let text = 'NEUTRAL';
      if (v < 45) { badge = 'bg-emerald-900/40 text-emerald-400'; text = 'BUY'; }
      if (v > 65) { badge = 'bg-red-900/40 text-red-400'; text = 'SELL'; }
      return <div className="flex items-center justify-center gap-2"><span>{v}</span><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${badge}`}>{text}</span></div>
  }},
  { label: 'Volatility (Ann.)', key: 'volatility', format: (v) => `${v.toFixed(1)}%` },
  { label: 'Predicted Tomorrow', key: 'predictedPrice', format: (v, m) => {
      const chg = ((v - m.currentPrice)/m.currentPrice*100).toFixed(2);
      return <div className="flex flex-col items-center justify-center gap-0.5">₹{v.toLocaleString('en-IN')} <span className={`text-[10px] ${chg>=0?'text-emerald-400':'text-red-400'}`}>({chg>=0?'+':''}{chg}%)</span></div>
  }},
  { label: 'AI Signal', key: 'signal', format: (v) => {
      let badge = 'bg-yellow-900/40 text-yellow-400';
      if (v === 'BUY') badge = 'bg-emerald-900/40 text-emerald-400';
      if (v === 'SELL') badge = 'bg-red-900/40 text-red-400';
      return <span className={`px-2 py-1 rounded text-xs font-bold ${badge}`}>{v}</span>
  }},
];

// -----------------------------------------------------------------------------
// MAIN COMPONENT
// -----------------------------------------------------------------------------

export default function Compare() {
  const [selectedStocks, setSelectedStocks] = useState(['RELIANCE.NS', 'TCS.NS']);
  const [period, setPeriod] = useState('1Y');
  const [activeSearchSlot, setActiveSearchSlot] = useState(null);

  const chartData = useMemo(() => {
    if (selectedStocks.length === 0) return [];
    const points = PERIOD_POINTS[period];
    const pricesObj = {};
    selectedStocks.forEach(sym => pricesObj[sym] = generatePrices(sym, points));
    
    const data = [];
    const now = new Date();
    for (let i = 0; i < points; i++) {
      const d = new Date(now);
      const daysBack = Math.round((points - 1 - i) * (252 / points) * 1.45);
      d.setDate(d.getDate() - daysBack);
      const row = { date: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) };
      
      selectedStocks.forEach(sym => {
        const raw = pricesObj[sym][i];
        const base = pricesObj[sym][0];
        row[sym] = (raw / base) * 100;
      });
      data.push(row);
    }
    return data;
  }, [selectedStocks, period]);

  const metricsData = useMemo(() => {
    return selectedStocks.map(sym => generateMetrics(sym, period));
  }, [selectedStocks, period]);

  const radarData = useMemo(() => {
    if (selectedStocks.length === 0) return [];
    const axes = ['Momentum', 'Trend', 'Value', 'Volume', 'Volatility', 'Quality'];
    return axes.map(axis => {
      const row = { metric: axis };
      metricsData.forEach(m => row[m.symbol] = m.radarScores[axis]);
      return row;
    });
  }, [metricsData, selectedStocks]);

  const aiSummary = useMemo(() => {
    if (selectedStocks.length < 2) return null;
    const sorted = [...metricsData].sort((a,b) => b.periodReturn - a.periodReturn);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    
    const sortedRsi = [...metricsData].sort((a,b) => b.rsi - a.rsi);
    const highestRsi = sortedRsi[0];
    const lowestRsi = sortedRsi[sortedRsi.length - 1];
    
    let totalCorr = 0; let pairs = 0;
    for(let i=0; i<selectedStocks.length; i++) {
      for(let j=i+1; j<selectedStocks.length; j++) {
         totalCorr += correlation(selectedStocks[i], selectedStocks[j]);
         pairs++;
      }
    }
    const avgCorr = pairs > 0 ? (totalCorr / pairs) : 0;
    const overlapStr = avgCorr > 0.7 ? "high" : avgCorr > 0.5 ? "moderate" : "low";
    const signalsStr = metricsData.map(m => `${m.symbol.replace('.NS','')} (${m.signal})`).join(', ');

    return `Among the ${selectedStocks.length} stocks compared over ${period}, ${best.symbol.replace('.NS','')} showed the strongest performance with a simulated return of ${best.periodReturn > 0 ? '+' : ''}${best.periodReturn.toFixed(2)}%, while ${worst.symbol.replace('.NS','')} lagged at ${worst.periodReturn.toFixed(2)}%. ${highestRsi.symbol.replace('.NS','')} appears ${highestRsi.rsi > 65 ? 'overbought' : 'strong'} (RSI ${highestRsi.rsi}) while ${lowestRsi.symbol.replace('.NS','')} shows a ${lowestRsi.rsi < 45 ? 'potential buying opportunity' : 'weak trend'} (RSI ${lowestRsi.rsi}). From a diversification perspective, the average correlation is ${avgCorr.toFixed(2)}, suggesting ${overlapStr} portfolio overlap. Overall AI signals: ${signalsStr}.`;
  }, [metricsData, selectedStocks, period]);

  const addStock = (sym) => {
    if (!sym || selectedStocks.length >= 4 || selectedStocks.includes(sym)) return;
    setSelectedStocks([...selectedStocks, sym]);
  };
  
  const removeStock = (sym) => {
    setSelectedStocks(selectedStocks.filter(s => s !== sym));
  };

  const getBestMetric = (key) => {
    if (metricsData.length < 2) return null;
    const vals = metricsData.map(m => m[key]);
    if (['pe', 'volatility', 'low52w'].includes(key)) return Math.min(...vals);
    return Math.max(...vals);
  };

  return (
    <div className="bg-[#0A0E1A] min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* SECTION 1 — Page Header */}
        <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <span className="text-xl">⚖️</span> Stock Comparison
            </h1>
            <p className="text-slate-400 text-sm mt-1">Compare up to 4 stocks side by side</p>
          </div>
          <div className="flex items-center gap-2 bg-[#141D35] border border-[#1E2D4F] p-1 rounded-xl">
            {['1M', '3M', '6M', '1Y', '2Y'].map(p => (
              <button 
                key={p} 
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${period === p ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 2 — Stock Selector Row */}
        <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6">
          <label className="block text-sm font-semibold text-slate-300 mb-4">Select stocks to compare (max 4)</label>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {[0, 1, 2, 3].map(index => {
              const sym = selectedStocks[index];
              if (sym) {
                const info = getStockInfo(sym);
                return (
                  <div key={sym} className="relative bg-[#141D35] border border-[#1E2D4F] rounded-xl p-3 w-full sm:w-48 flex-shrink-0 flex flex-col items-center text-center overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1" style={{backgroundColor: COLORS[index]}}></div>
                    <button onClick={() => removeStock(sym)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                    <div className="font-mono font-bold text-slate-100 mt-2 mb-1 truncate w-full px-4">{sym.replace('.NS','')}</div>
                    <div className="text-slate-400 text-xs truncate w-full mb-2">{info.name}</div>
                    <div className="bg-slate-800 text-slate-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">{info.sector}</div>
                  </div>
                );
              }
              if (activeSearchSlot === index) {
                return (
                  <div key={`slot-${index}`} className="relative bg-[#141D35] border border-blue-500 rounded-xl p-3 w-full sm:w-48 flex-shrink-0 flex flex-col items-center justify-center min-h-[108px] z-50">
                    <StockSearchBar value="" onChange={()=>{}} onSelect={(val) => { addStock(val); setActiveSearchSlot(null); }} />
                    <button onClick={() => setActiveSearchSlot(null)} className="text-xs text-slate-500 mt-3 hover:text-slate-300">Cancel</button>
                  </div>
                );
              }
              return (
                <button 
                  key={`empty-${index}`} 
                  onClick={() => selectedStocks.length < 4 && setActiveSearchSlot(index)} 
                  disabled={selectedStocks.length >= 4}
                  className="relative bg-transparent border border-dashed border-[#1E2D4F] rounded-xl p-3 w-full sm:w-48 flex-shrink-0 flex flex-col items-center justify-center min-h-[108px] hover:border-slate-500 hover:bg-[#141D35]/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-6 h-6 text-slate-500 mb-1" />
                  <span className="text-slate-500 text-sm font-semibold">Add Stock</span>
                </button>
              );
            })}
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500 text-sm">Quick Add:</span>
            {QUICK_ADDS.filter(s => !selectedStocks.includes(s)).slice(0, 5).map(sym => (
              <button 
                key={sym}
                onClick={() => addStock(sym)}
                className="text-xs font-mono font-bold px-3 py-1.5 bg-[#141D35] border border-[#1E2D4F] hover:border-blue-500/50 text-slate-300 rounded-lg transition-colors"
              >
                + {sym.replace('.NS', '')}
              </button>
            ))}
          </div>
        </div>

        {selectedStocks.length === 0 ? (
          <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-16 flex flex-col items-center justify-center text-center">
            <BarChart2 className="w-16 h-16 text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">No stocks selected</h3>
            <p className="text-slate-500 max-w-md">Add 2 to 4 stocks above to start comparing their performance and AI metrics.</p>
          </div>
        ) : (
          <>
            {/* SECTION 3 — Normalized Price Chart */}
            <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-lg font-bold text-slate-200">Price Performance (Rebased to 100)</h2>
                <div className="group relative">
                  <Info className="w-4 h-4 text-slate-500 cursor-help" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-800 text-slate-200 text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
                    All prices rebased to 100 at start date so you can compare % returns regardless of absolute price
                  </div>
                </div>
              </div>
              
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E2D4F" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#1E2D4F' }} minTickGap={30} />
                    <YAxis domain={['auto', 'auto']} tickFormatter={v => v.toFixed(0)} tick={{ fill: '#64748B', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#1E2D4F' }} width={40} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F1629', borderColor: '#1E2D4F', color: '#E2E8F0', borderRadius: '12px' }}
                      itemStyle={{ fontWeight: 'bold' }}
                      formatter={(value, name) => [`${value.toFixed(1)} (${(value - 100) > 0 ? '+' : ''}${(value - 100).toFixed(1)}%)`, name.replace('.NS', '')]}
                      labelStyle={{ color: '#94A3B8', marginBottom: '8px' }}
                    />
                    <ReferenceLine y={100} stroke="#374151" strokeDasharray="4 2" label={{ value: "Base (100)", fill: "#64748B", fontSize: 10, position: 'insideBottomLeft' }} />
                    {selectedStocks.map((sym, i) => (
                      <Line key={sym} type="monotone" dataKey={sym} stroke={COLORS[i]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} name={sym} />
                    ))}
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} formatter={(v) => <span className="text-slate-300 font-mono font-bold">{v.replace('.NS','')}</span>} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SECTION 4 — Comparison Metrics Table */}
            <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6 overflow-x-auto">
              <h2 className="text-lg font-bold text-slate-200 mb-6">Side-by-Side Metrics</h2>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 border-b border-[#1E2D4F] text-slate-500 font-semibold text-sm w-48">Metric</th>
                    {selectedStocks.map((sym, i) => {
                      const info = getStockInfo(sym);
                      return (
                        <th key={sym} className="p-4 border-b border-[#1E2D4F] text-center min-w-[140px]">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i]}}></span>
                              <span className="font-mono font-bold text-slate-100">{sym.replace('.NS', '')}</span>
                            </div>
                            <span className="bg-slate-800 text-slate-400 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full">{info.sector}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2D4F]/50">
                  {METRICS_CONFIG.map(config => {
                    const bestVal = getBestMetric(config.key);
                    return (
                      <tr key={config.key} className="hover:bg-[#141D35]/30 transition-colors">
                        <td className="p-4 text-slate-400 text-sm font-semibold">{config.label}</td>
                        {metricsData.map(m => {
                          const isBest = selectedStocks.length > 1 && m[config.key] === bestVal;
                          return (
                            <td key={m.symbol} className={`p-4 text-center font-mono text-sm text-slate-200 ${isBest ? 'bg-emerald-900/10' : ''}`}>
                              {config.format(m[config.key], m)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* SECTION 5 — Radar / Spider Chart */}
              <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6 flex flex-col">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-200">Multi-Dimensional Score</h2>
                  <p className="text-slate-400 text-xs mt-1">Each axis scored 0-100 based on simulated signals</p>
                </div>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                      <PolarGrid stroke="#1E2D4F" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 9 }} tickCount={5} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F1629', borderColor: '#1E2D4F', color: '#E2E8F0', borderRadius: '12px' }} />
                      {selectedStocks.map((sym, i) => (
                        <Radar key={sym} name={sym.replace('.NS','')} dataKey={sym} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
                      ))}
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SECTION 6 — Correlation Matrix & AI Summary */}
              <div className="flex flex-col gap-6">
                
                {selectedStocks.length >= 2 && (
                  <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6">
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-200">Price Correlation Matrix</h2>
                      <p className="text-slate-400 text-xs mt-1">How closely do these stocks move together? (1.0 = perfect correlation, 0 = none)</p>
                    </div>
                    
                    <div className="overflow-x-auto rounded-xl border border-[#1E2D4F]">
                      <div className="grid" style={{gridTemplateColumns: `auto repeat(${selectedStocks.length}, minmax(80px, 1fr))`}}>
                        <div className="p-3 bg-[#141D35] border-b border-[#1E2D4F]"></div>
                        {selectedStocks.map((sym, i) => (
                          <div key={sym} className="p-3 bg-[#141D35] text-center font-bold text-slate-300 font-mono text-xs border-b border-l border-[#1E2D4F] truncate">
                            <span className="w-1.5 h-1.5 rounded-full inline-block mr-1.5" style={{backgroundColor: COLORS[i]}}></span>
                            {sym.split('.')[0]}
                          </div>
                        ))}
                        
                        {selectedStocks.map((sym1, i) => (
                          <React.Fragment key={sym1}>
                            <div className="p-3 bg-[#141D35] font-bold text-slate-300 font-mono text-xs flex items-center border-b border-[#1E2D4F] truncate">
                              <span className="w-1.5 h-1.5 rounded-full inline-block mr-1.5" style={{backgroundColor: COLORS[i]}}></span>
                              {sym1.split('.')[0]}
                            </div>
                            {selectedStocks.map((sym2) => {
                              const c = correlation(sym1, sym2);
                              let bg = 'bg-red-900/40 text-red-200';
                              if (c > 0.3) bg = 'bg-yellow-900/40 text-yellow-200';
                              if (c > 0.6) bg = 'bg-blue-900/40 text-blue-200';
                              if (c > 0.8) bg = 'bg-emerald-900/40 text-emerald-200';
                              if (sym1 === sym2) bg = 'bg-[#141D35] text-slate-500';
                              return (
                                <div key={`${sym1}-${sym2}`} className={`p-4 text-center font-mono text-sm border-b border-l border-[#1E2D4F] font-bold transition-colors ${bg}`}>
                                  {sym1 === sym2 ? '-' : c.toFixed(2)}
                                </div>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap items-center justify-between text-[10px] text-slate-400 uppercase font-bold px-2">
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-900/60"></span> Low (0-0.3)</div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-900/60"></span> Moderate (0.3-0.6)</div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-900/60"></span> High (0.6-0.8)</div>
                      <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-900/60"></span> Very High (0.8-1.0)</div>
                    </div>
                  </div>
                )}

                {/* SECTION 7 — AI Comparison Summary */}
                {selectedStocks.length >= 2 && (
                  <div className="bg-gradient-to-br from-blue-900/20 to-violet-900/20 border border-blue-500/30 rounded-2xl p-6 flex-1">
                    <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
                      🤖 AI Comparison Summary
                    </h2>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {aiSummary}
                    </p>
                  </div>
                )}

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
