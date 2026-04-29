import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, TrendingDown,
         RefreshCw, Download } from 'lucide-react';
import { fetchPrediction } from '../services/api';
import StatCard from '../components/StatCard';
import MainPriceChart from '../components/MainPriceChart';
import RSIChart from '../components/RSIChart';
import MACDChart from '../components/MACDChart';
import BollingerChart from '../components/BollingerChart';
import PatternCard from '../components/PatternCard';
import AIInsightPanel from '../components/AIInsightPanel';
import IndicatorsPanel from '../components/IndicatorsPanel';
import LoadingOverlay from '../components/LoadingOverlay';
import VolumeChart from '../components/VolumeChart';
import RecommendationCard from '../components/RecommendationCard';
import StockSearchBar from '../components/StockSearchBar';
import HoldingReportPanel from '../components/HoldingReportPanel';
import StockUniverseBrowser from '../components/StockUniverseBrowser';

const PERIOD_OPTIONS = ['3M','6M','1Y','2Y','5Y'];
const TRENDING_STOCKS = [
  'RELIANCE.NS','TCS.NS','INFY.NS','HDFCBANK.NS',
  'ICICIBANK.NS','WIPRO.NS','SBIN.NS'
];

// Period label → API value map
const PERIOD_MAP = {
  '3M': '3mo', '6M': '6mo',
  '1Y': '1y',  '2Y': '2y', '5Y': '5y'
};

export default function Dashboard() {
  const location = useLocation();
  const [symbol, setSymbol] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('symbol') || 'RELIANCE.NS';
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sym = params.get('symbol');
    if (sym && sym !== symbol) {
      setSymbol(sym);
    }
  }, [location.search]);
  const [period,     setPeriod]     = useState('1Y');
  const [prediction, setPrediction] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [activeTab,  setActiveTab]  = useState('price');

  const handlePredict = useCallback(async () => {
    if (!symbol.trim()) return;
    setLoading(true);
    setError(null);
    setPrediction(null);

    const apiPeriod = PERIOD_MAP[period] || '1y';
    const { data, error: err } = await fetchPrediction(
      symbol.trim().toUpperCase(),
      apiPeriod
    );

    if (err) {
      setError(err);
    } else {
      setPrediction(data);
      // Save to history and recently searched
      try {
        const historyData = JSON.parse(localStorage.getItem('visitedHistory') || '[]');
        const newEntry = { symbol: symbol, date: new Date().toISOString() };
        const filtered = historyData.filter(item => item.symbol !== symbol);
        const updatedHistory = [newEntry, ...filtered].slice(0, 50);
        localStorage.setItem('visitedHistory', JSON.stringify(updatedHistory));
        
        const recent = JSON.parse(localStorage.getItem('recentStocks') || '[]');
        const updatedRecent = [symbol, ...recent.filter(s => s !== symbol)].slice(0, 5);
        localStorage.setItem('recentStocks', JSON.stringify(updatedRecent));
      } catch {}
    }
    setLoading(false);
  }, [symbol, period]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handlePredict();
  };

  const isBullish = prediction?.trend === 'Bullish';

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-slate-100 p-6">
      {loading && <LoadingOverlay />}

      {/* Search Section */}
      <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Input */}
          <StockSearchBar
            value={symbol}
            onChange={(val) => setSymbol(val)}
            onSelect={(sym) => setSymbol(sym)}
          />

          {/* Period */}
          <div className="flex gap-2 items-center bg-[#141D35]
                          border border-[#1E2D4F] rounded-xl p-1">
            {PERIOD_OPTIONS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium
                            transition-all ${
                  period === p
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2D4F]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Predict Button */}
          <button
            onClick={handlePredict}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500
                       disabled:bg-slate-700 disabled:cursor-not-allowed
                       text-white px-8 py-4 rounded-xl font-semibold
                       text-base transition-all shadow-lg shadow-blue-500/20
                       hover:shadow-blue-500/40 active:scale-95"
          >
            {loading
              ? <RefreshCw className="w-5 h-5 animate-spin"/>
              : <Search className="w-5 h-5"/>
            }
            {loading ? 'Analyzing...' : 'Analyze & Predict'}
          </button>
        </div>

        {/* Trending chips */}
        <div className="flex flex-wrap gap-2 mt-4 items-center">
          <span className="text-slate-500 text-sm">Trending:</span>
          {TRENDING_STOCKS.map(s => (
            <button
              key={s}
              onClick={() => { setSymbol(s); }}
              className="px-3 py-1 bg-[#141D35] border border-[#1E2D4F]
                         hover:border-blue-500/50 text-slate-400
                         hover:text-slate-200 rounded-full text-xs
                         transition-all font-mono"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Universe Browser */}
      <StockUniverseBrowser onSelect={(sym) => { setSymbol(sym); }} />

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-900/30 border border-red-500/50 rounded-xl
                       p-4 mb-6"
          >
            <p className="text-red-400 font-semibold">Prediction failed</p>
            <p className="text-red-300/80 text-sm mt-1">{error}</p>
            <p className="text-slate-500 text-xs mt-2">
              Check that the symbol is correct (e.g. RELIANCE.NS, TCS.NS)
              and that the ML service is running on port 8000.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results — only render when prediction exists */}
      {prediction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Stat Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <StatCard
              label="Current Price"
              value={`₹${prediction.current_price.toLocaleString('en-IN',
                {minimumFractionDigits:2, maximumFractionDigits:2})}`}
              sub={prediction.symbol}
              color="blue"
            />
            <StatCard
              label="Predicted Price"
              value={`₹${prediction.predicted_price.toLocaleString('en-IN',
                {minimumFractionDigits:2, maximumFractionDigits:2})}`}
              sub={`${prediction.predicted_change_pct >= 0 ? '+' : ''}
                   ${prediction.predicted_change_pct.toFixed(2)}%`}
              color={isBullish ? 'green' : 'red'}
            />
            <StatCard
              label="Trend"
              value={prediction.trend}
              icon={isBullish
                ? <TrendingUp className="w-6 h-6 text-emerald-400"/>
                : <TrendingDown className="w-6 h-6 text-red-400"/>}
              color={isBullish ? 'green' : 'red'}
            />
            <StatCard
              label="Confidence"
              value={`${prediction.confidence.toFixed(1)}%`}
              sub={`MAPE: ${prediction.error_rate.toFixed(2)}%`}
              color="purple"
              showRing={true}
              ringValue={prediction.confidence}
            />
            <StatCard
              label="Model R²"
              value={`${(prediction.model_metrics.r_squared * 100).toFixed(1)}%`}
              sub={`${prediction.model_metrics.training_samples} samples`}
              color="amber"
            />
          </div>

          <RecommendationCard
            rec={prediction.recommendation}
            symbol={prediction.symbol}
          />

          {/* Main Chart */}
          <div className="bg-[#0F1629] border border-[#1E2D4F]
                          rounded-2xl p-6 mb-6">
            {/* Tab bar */}
            <div className="flex gap-1 mb-6 bg-[#141D35] rounded-xl
                            p-1 w-fit">
              {['price','predictions','indicators'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium
                              capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab === 'price'       ? 'Price History'     :
                   tab === 'predictions' ? 'Prediction Overlay' :
                                          'Indicators'}
                </button>
              ))}
            </div>

            {activeTab === 'price' && (
              <MainPriceChart
                data={prediction.historical_data}
                indicators={prediction.indicators}
                supportResistance={prediction.support_resistance}
              />
            )}
            {activeTab === 'predictions' && (
              <MainPriceChart
                data={prediction.historical_data}
                overlay={prediction.predictions_overlay}
                showOverlay={true}
                metrics={prediction.model_metrics}
              />
            )}
            {activeTab === 'indicators' && (
              <IndicatorsPanel
                indicators={prediction.indicators}
                data={prediction.historical_data}
              />
            )}
          </div>

          {/* 3-column row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Indicators signals */}
            <div className="lg:col-span-5 bg-[#0F1629] border
                            border-[#1E2D4F] rounded-2xl p-5">
              <h3 className="text-slate-300 font-semibold mb-4 flex
                             items-center gap-2 text-sm uppercase
                             tracking-widest">
                Technical Signals
              </h3>
              <div className="space-y-2">
                {prediction.indicators.signals_summary.length > 0
                  ? prediction.indicators.signals_summary.map((s, i) => (
                    <div key={i}
                         className="flex items-center justify-between
                                    py-2 border-b border-[#1E2D4F]
                                    last:border-0">
                      <span className="text-slate-400 text-sm">{s.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-slate-300">
                          {typeof s.value === 'number'
                            ? s.value.toFixed(2) : s.value}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs
                                         font-bold ${
                          s.signal === 'BUY'
                            ? 'bg-emerald-900/50 text-emerald-400'
                            : s.signal === 'SELL'
                            ? 'bg-red-900/50 text-red-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {s.signal}
                        </span>
                      </div>
                    </div>
                  ))
                  : <p className="text-slate-500 text-sm">
                      No signals available
                    </p>
                }
              </div>
            </div>

            {/* Patterns */}
            <div className="lg:col-span-4 bg-[#0F1629] border
                            border-[#1E2D4F] rounded-2xl p-5">
              <h3 className="text-slate-300 font-semibold mb-4 text-sm
                             uppercase tracking-widest">
                Detected Patterns
              </h3>
              {prediction.patterns.length > 0
                ? prediction.patterns.map((p, i) => (
                  <PatternCard key={i} pattern={p}/>
                ))
                : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 text-sm">
                      No significant patterns detected
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                      Try a longer period (1Y or 2Y)
                    </p>
                  </div>
                )
              }

              {/* Support & Resistance */}
              {(prediction.support_resistance.support.length > 0 ||
                prediction.support_resistance.resistance.length > 0) && (
                <div className="mt-4 pt-4 border-t border-[#1E2D4F]">
                  <p className="text-slate-500 text-xs uppercase
                                tracking-widest mb-3">
                    Support & Resistance
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-emerald-400 text-xs mb-1">
                        Support
                      </p>
                      {prediction.support_resistance.support
                        .slice(0, 3).map((s, i) => (
                        <p key={i} className="font-mono text-xs
                                              text-slate-300">
                          ₹{s.price?.toFixed(2)}
                          <span className="text-slate-600 ml-1">
                            ({s.touch_count}x)
                          </span>
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-red-400 text-xs mb-1">
                        Resistance
                      </p>
                      {prediction.support_resistance.resistance
                        .slice(0, 3).map((r, i) => (
                        <p key={i} className="font-mono text-xs
                                              text-slate-300">
                          ₹{r.price?.toFixed(2)}
                          <span className="text-slate-600 ml-1">
                            ({r.touch_count}x)
                          </span>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Insight */}
            <div className="lg:col-span-3">
              <AIInsightPanel
                summary={prediction.ai_summary}
                trend={prediction.trend}
                confidence={prediction.confidence}
              />
            </div>
          </div>

          {/* Sub-charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0F1629] border border-[#1E2D4F]
                            rounded-2xl p-5">
              <h4 className="text-slate-400 text-xs uppercase
                             tracking-widest mb-4">RSI (14)</h4>
              <RSIChart
                series={prediction.indicators.rsi_series}
                dates={prediction.indicators.dates}
              />
            </div>
            <div className="bg-[#0F1629] border border-[#1E2D4F]
                            rounded-2xl p-5">
              <h4 className="text-slate-400 text-xs uppercase
                             tracking-widest mb-4">MACD</h4>
              <MACDChart
                macd={prediction.indicators.macd_series}
                signal={prediction.indicators.signal_series}
                hist={prediction.indicators.hist_series}
                dates={prediction.indicators.dates}
              />
            </div>
            <div className="bg-[#0F1629] border border-[#1E2D4F]
                            rounded-2xl p-5">
              <h4 className="text-slate-400 text-xs uppercase
                             tracking-widest mb-4">Bollinger Bands</h4>
              <BollingerChart
                data={prediction.historical_data}
                upper={prediction.indicators.bollinger_upper_series}
                lower={prediction.indicators.bollinger_lower_series}
                mid={prediction.indicators.bollinger_mid_series}
              />
            </div>
            <div className="bg-[#0F1629] border border-[#1E2D4F]
                            rounded-2xl p-5">
              <h4 className="text-slate-400 text-xs uppercase
                             tracking-widest mb-4">Volume</h4>
              <VolumeChart
                data={prediction.historical_data}
              />
            </div>
          </div>

          <HoldingReportPanel prediction={prediction} />
        </motion.div>
      )}
    </div>
  );
}
