import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Trash2, Pencil, Eye, EyeOff, TrendingUp, TrendingDown, Plus, X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import StockSearchBar from '../components/StockSearchBar';

const INITIAL_ALERTS = [
  { id: 1, symbol: 'RELIANCE.NS', condition: 'above', targetPrice: 1450, note: 'Breakout above resistance', active: true, triggered: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 2, symbol: 'TCS.NS', condition: 'below', targetPrice: 3800, note: 'Buy the dip', active: true, triggered: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 3, symbol: 'INFY.NS', condition: 'above', targetPrice: 1750, note: '52-week high breakout', active: false, triggered: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const INITIAL_PRICES = {
  'RELIANCE.NS': 1432, 'TCS.NS': 3850,
  'INFY.NS': 1748,     'HDFCBANK.NS': 1692,
  'SBIN.NS': 812,      'BAJFINANCE.NS': 6840,
  'TATAMOTORS.NS': 945,'ADANIENT.NS': 2340,
};

const SUGGESTIONS = [
  { symbol: 'RELIANCE.NS', condition: 'above', targetPrice: 1400 },
  { symbol: 'TCS.NS', condition: 'above', targetPrice: 4000 },
  { symbol: 'INFY.NS', condition: 'below', targetPrice: 1600 },
  { symbol: 'HDFCBANK.NS', condition: 'above', targetPrice: 1800 }
];

const Sparkline = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function Alerts() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [prices, setPrices] = useState(INITIAL_PRICES);
  const [priceHistory, setPriceHistory] = useState(() => {
    const hist = {};
    for (const key in INITIAL_PRICES) {
      hist[key] = [INITIAL_PRICES[key], INITIAL_PRICES[key], INITIAL_PRICES[key], INITIAL_PRICES[key], INITIAL_PRICES[key]];
    }
    return hist;
  });
  const [toasts, setToasts] = useState([]);
  const [flashingStocks, setFlashingStocks] = useState({});
  
  const [filter, setFilter] = useState('all');
  const [showHistory, setShowHistory] = useState(false);
  
  const [newSymbol, setNewSymbol] = useState('');
  const [newCondition, setNewCondition] = useState('above');
  const [newTarget, setNewTarget] = useState('');
  const [newNote, setNewNote] = useState('');

  // Initialize simulated price for newly selected stocks so the user can see the CMP
  useEffect(() => {
    if (newSymbol && !prices[newSymbol]) {
      let hash = 0;
      for (let i = 0; i < newSymbol.length; i++) {
        hash = newSymbol.charCodeAt(i) + ((hash << 5) - hash);
      }
      const pseudoRandomPrice = 100 + (Math.abs(hash) % 4000); 
      setPrices(p => ({ ...p, [newSymbol]: pseudoRandomPrice }));
    }
  }, [newSymbol, prices]);

  // Toast System
  const addToast = (message, type = 'alert') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }].slice(-3));
    setTimeout(() => removeToast(id), 5000);
  };
  
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Interval Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev };
        const nextHistory = { ...priceHistory };
        let updatedAlerts = [...alerts];
        let alertsChanged = false;
        
        for (const sym in next) {
          const changePct = (Math.random() * 0.6) - 0.3; // ±0.3% walk
          const newPrice = next[sym] * (1 + changePct / 100);
          next[sym] = newPrice;
          
          if (!nextHistory[sym]) nextHistory[sym] = Array(5).fill(newPrice);
          nextHistory[sym] = [...nextHistory[sym].slice(1), newPrice];

          updatedAlerts = updatedAlerts.map(a => {
            if (a.symbol === sym && a.active && !a.triggered) {
              if ((a.condition === 'above' && newPrice >= a.targetPrice) ||
                  (a.condition === 'below' && newPrice <= a.targetPrice)) {
                alertsChanged = true;
                addToast(`🔔 ${sym} crossed ₹${a.targetPrice.toLocaleString('en-IN')}!`, 'alert');
                
                setFlashingStocks(f => ({ ...f, [sym]: true }));
                setTimeout(() => setFlashingStocks(f => ({ ...f, [sym]: false })), 5000);

                return { ...a, active: false, triggered: true, triggeredAt: new Date().toISOString() };
              }
            }
            return a;
          });
        }
        
        setPriceHistory(nextHistory);
        if (alertsChanged) setAlerts(updatedAlerts);
        return next;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [alerts, priceHistory]);

  const handleCreateAlert = () => {
    if (!newSymbol || !newTarget) return;
    const alert = {
      id: Date.now(),
      symbol: newSymbol.toUpperCase(),
      condition: newCondition,
      targetPrice: parseFloat(newTarget),
      note: newNote,
      active: true,
      triggered: false,
      createdAt: new Date().toISOString()
    };
    
    // Add to simulated prices if not exists
    if (!prices[alert.symbol]) {
      setPrices(p => ({ ...p, [alert.symbol]: alert.targetPrice * (alert.condition === 'above' ? 0.95 : 1.05) }));
    }
    
    setAlerts([alert, ...alerts]);
    setNewSymbol('');
    setNewTarget('');
    setNewNote('');
    addToast('Alert created successfully', 'success');
  };

  const handleQuickAlert = (s) => {
    setNewSymbol(s.symbol);
    setNewCondition(s.condition);
    setNewTarget(s.targetPrice);
  };

  const toggleAlert = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };
  
  const deleteAlert = (id) => {
    if(window.confirm('Delete this alert?')) {
      setAlerts(alerts.filter(a => a.id !== id));
      addToast('Alert deleted', 'success');
    }
  };

  const resetAlert = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, active: true, triggered: false } : a));
    addToast('Alert reset and active', 'success');
  };

  // Helpers
  const formatPrice = (p) => p ? `₹${p.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹0.00';
  
  const timeAgo = (iso) => {
    if (!iso) return '';
    const s = Math.floor((new Date() - new Date(iso)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  const distanceToTarget = (current, target, condition) => {
    if (!current || !target) return { pct: 0 };
    let pct = 0;
    if (condition === 'above') {
      pct = (current / target) * 100;
    } else {
      pct = (target / current) * 100;
    }
    return { pct: Math.min(pct, 100) }; 
  };

  // Stats
  const activeCount = alerts.filter(a => a.active && !a.triggered).length;
  const triggeredCount = alerts.filter(a => a.triggered).length;
  
  const activeTabAlerts = alerts.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'active') return a.active && !a.triggered;
    if (filter === 'triggered') return a.triggered;
    return true;
  });

  const triggeredAlertsList = alerts.filter(a => a.triggered);

  return (
    <div className="bg-[#0A0E1A] min-h-screen p-6 relative pb-32">
      {/* TOASTS */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 transition-all ${
            t.type === 'alert' ? 'bg-yellow-900/95 border border-yellow-500 text-yellow-200' :
            t.type === 'success' ? 'bg-emerald-900/95 border border-emerald-500 text-emerald-200' :
            'bg-red-900/95 border border-red-500 text-red-400'
          }`}>
            <span className="font-medium text-sm">{t.message}</span>
            <button onClick={() => removeToast(t.id)}><X className="w-4 h-4 opacity-70 hover:opacity-100" /></button>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* SECTION 1 — Page Header */}
        <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-500" /> Price Alerts
            </h1>
            <p className="text-slate-400 text-sm mt-1">Get notified when stocks hit your target price</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-emerald-900/40 text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm">
              {activeCount} Active
            </div>
            <div className="bg-blue-900/40 text-blue-400 px-4 py-2 rounded-xl font-bold text-sm">
              {triggeredCount} Triggered
            </div>
            <div className="bg-slate-800 text-slate-400 px-4 py-2 rounded-xl font-bold text-sm">
              {alerts.length} Total
            </div>
          </div>
        </div>

        {/* SECTION 2 — Create Alert Form */}
        <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" /> Create New Alert
          </h2>
          
          <div className="flex flex-col md:flex-row items-end gap-4 mb-4 relative z-40">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Target Stock</label>
              <StockSearchBar value={newSymbol} onChange={setNewSymbol} onSelect={setNewSymbol} />
            </div>
            
            <div className="flex bg-[#141D35] border border-[#1E2D4F] rounded-xl p-1 flex-shrink-0 h-[52px]">
              <button 
                onClick={() => setNewCondition('above')}
                className={`px-4 h-full rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${newCondition === 'above' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                ▲ Above
              </button>
              <button 
                onClick={() => setNewCondition('below')}
                className={`px-4 h-full rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${newCondition === 'below' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                ▼ Below
              </button>
            </div>
            
            <div className="relative w-full md:w-48 flex-shrink-0">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Target Price</span>
                {newSymbol && prices[newSymbol] && (
                  <span className="text-xs font-semibold text-blue-400 font-mono bg-blue-900/20 px-2 py-0.5 rounded border border-blue-900/50">
                    CMP: {formatPrice(prices[newSymbol])}
                  </span>
                )}
              </div>
              <div className="relative h-[52px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full bg-[#141D35] border border-[#1E2D4F] rounded-xl pl-8 pr-3 py-3 text-slate-200 font-mono text-lg focus:border-blue-500 focus:outline-none h-full"
                />
              </div>
            </div>
            
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 px-1">Alert Note</label>
              <input 
                type="text" 
                placeholder="Optional note (e.g. Breakout above resistance)"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full bg-[#141D35] border border-[#1E2D4F] rounded-xl px-4 py-3 text-slate-200 focus:border-blue-500 focus:outline-none h-[52px]"
              />
            </div>
            
            <button 
              onClick={handleCreateAlert}
              disabled={!newSymbol || !newTarget}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold px-6 rounded-xl flex items-center justify-center gap-2 transition-colors flex-shrink-0 h-[52px]"
            >
              <Bell className="w-5 h-5" /> Set Alert
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500 text-sm">Quick alerts:</span>
            {SUGGESTIONS.map((s, i) => (
              <button 
                key={i}
                onClick={() => handleQuickAlert(s)}
                className="text-xs font-mono font-bold px-3 py-1.5 bg-[#141D35] border border-[#1E2D4F] hover:border-blue-500/50 text-slate-300 rounded-lg transition-colors"
              >
                {s.symbol.replace('.NS', '')} {s.condition === 'above' ? '>' : '<'} ₹{s.targetPrice}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 3 — Active Alerts List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100">Alerts List ({activeTabAlerts.length})</h2>
            <div className="flex bg-[#0F1629] border border-[#1E2D4F] rounded-xl p-1">
              {['all', 'active', 'triggered'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-colors ${filter === f ? 'bg-blue-600/20 text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {activeTabAlerts.length === 0 ? (
            <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
              <BellOff className="w-16 h-16 text-slate-700 mb-4" />
              <h3 className="text-xl font-bold text-slate-300 mb-2">No alerts found</h3>
              <p className="text-slate-500 max-w-md mb-6">Create an alert above to get notified when a stock hits your target price.</p>
              <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-2">
                <Plus className="w-5 h-5" /> Create Alert
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeTabAlerts.map(alert => {
                const curPrice = prices[alert.symbol] || 0;
                const dist = distanceToTarget(curPrice, alert.targetPrice, alert.condition);
                const isAbove = alert.condition === 'above';
                const hist = priceHistory[alert.symbol];
                const pctChange = hist ? ((curPrice - hist[0]) / hist[0] * 100) : 0;

                return (
                  <div key={alert.id} className="bg-[#0F1629] border border-[#1E2D4F] rounded-xl p-4 hover:border-blue-500/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    
                    <div className="w-48 flex-shrink-0">
                      <div className="font-mono font-bold text-slate-100 text-lg flex items-center gap-2">
                        {alert.symbol.replace('.NS', '')}
                      </div>
                      <div className="text-slate-500 text-xs font-mono">{alert.symbol}</div>
                      {alert.note && <div className="text-slate-400 text-xs mt-1 truncate" title={alert.note}>{alert.note}</div>}
                    </div>

                    <div className="w-48 flex-shrink-0">
                      <div className={`px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 ${isAbove ? 'bg-emerald-900/20 text-emerald-400' : 'bg-red-900/20 text-red-400'}`}>
                        {isAbove ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="font-bold text-xs uppercase tracking-wider">{alert.condition}</span>
                      </div>
                      <div className={`font-mono font-bold text-xl mt-1.5 ${isAbove ? 'text-emerald-400' : 'text-red-400'}`}>
                        ₹{alert.targetPrice.toLocaleString('en-IN', {minimumFractionDigits:2})}
                      </div>
                    </div>

                    <div className="w-40 flex-shrink-0">
                      <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        Current Price
                        {alert.active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                      </div>
                      <div className="font-mono text-slate-200 text-lg">
                        {formatPrice(curPrice)}
                      </div>
                      <div className={`font-mono text-xs font-bold ${pctChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {pctChange >= 0 ? '+' : ''}{pctChange.toFixed(2)}%
                      </div>
                    </div>

                    <div className="w-48 flex-shrink-0">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-500 uppercase tracking-wider font-semibold">Distance</span>
                        <span className={dist.pct >= 90 ? 'text-emerald-400' : 'text-slate-400'}>
                          {dist.pct >= 100 ? 0 : (100 - dist.pct).toFixed(1)}% away
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[#141D35] rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${dist.pct >= 90 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                          style={{ width: `${dist.pct}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-end justify-center gap-3">
                      <div className="flex items-center gap-2">
                        {alert.triggered ? (
                          <span className="px-2.5 py-1 rounded-md bg-blue-900/30 text-blue-400 text-xs font-bold flex items-center gap-1.5">
                            <Check className="w-3 h-3" /> TRIGGERED
                          </span>
                        ) : alert.active ? (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-900/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ACTIVE
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 text-xs font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span> INACTIVE
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <div className="text-slate-600 text-xs mr-3">Set {timeAgo(alert.createdAt)}</div>
                        {!alert.triggered && (
                          <button onClick={() => toggleAlert(alert.id)} className="p-1.5 hover:bg-[#141D35] rounded-lg text-slate-400 hover:text-slate-200 transition-colors">
                            {alert.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        )}
                        <button className="p-1.5 hover:bg-[#141D35] rounded-lg text-slate-400 hover:text-blue-400 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteAlert(alert.id)} className="p-1.5 hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 4 — Triggered Alerts History */}
        <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl overflow-hidden">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-5 flex items-center justify-between text-slate-200 hover:bg-[#141D35] transition-colors"
          >
            <span className="font-bold flex items-center gap-2">
              📋 Triggered History ({triggeredAlertsList.length})
            </span>
            {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showHistory && (
            <div className="p-5 border-t border-[#1E2D4F]">
              {triggeredAlertsList.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No triggered alerts yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-[#141D35] text-xs uppercase text-slate-500 font-semibold border-b border-[#1E2D4F]">
                      <tr>
                        <th className="px-4 py-3">Symbol</th>
                        <th className="px-4 py-3">Condition</th>
                        <th className="px-4 py-3">Target</th>
                        <th className="px-4 py-3">Triggered At</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2D4F]">
                      {triggeredAlertsList.map(a => (
                        <tr key={a.id} className="hover:bg-[#141D35]/50 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-slate-200">{a.symbol}</td>
                          <td className="px-4 py-3">
                            <span className={a.condition === 'above' ? 'text-emerald-400' : 'text-red-400'}>
                              {a.condition.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono">₹{a.targetPrice.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3">{timeAgo(a.triggeredAt || a.createdAt)}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => resetAlert(a.id)} className="text-blue-400 hover:text-blue-300 font-bold text-xs bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-900/50">
                              Re-set
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5 — Market Overview Strip */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0A0E1A]/95 backdrop-blur-xl border-t border-[#1E2D4F] p-4 z-40">
        <div className="max-w-screen-2xl mx-auto overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-4 min-w-max">
            {Object.entries(prices).map(([sym, price]) => {
              const hist = priceHistory[sym] || [price, price];
              const change = price - hist[0];
              const pct = (change / hist[0]) * 100;
              const isFlashing = flashingStocks[sym];
              const isUp = pct >= 0;

              return (
                <div key={sym} className={`bg-[#141D35] border rounded-xl px-4 py-2.5 flex items-center gap-5 transition-all duration-300 ${isFlashing ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] animate-pulse' : 'border-[#1E2D4F]'}`}>
                  <div>
                    <div className="font-mono font-bold text-slate-200 text-sm">{sym.replace('.NS', '')}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-sm text-slate-300">{formatPrice(price)}</span>
                      <span className={`font-mono text-xs font-bold flex items-center ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isUp ? '+' : ''}{pct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="opacity-70 flex-shrink-0">
                    <Sparkline data={hist} color={isUp ? '#34d399' : '#f87171'} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
