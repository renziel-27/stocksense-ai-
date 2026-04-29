import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronRight,
         TrendingUp, Database, Brain, BarChart2,
         Shield, Zap, Globe, Smartphone,
         Download, ExternalLink } from 'lucide-react';

export default function ProjectReport() {
  const [activeSection, setActiveSection] = useState('problem');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState(null);

  const sections = [
    { id: 'problem', title: 'Problem Statement' },
    { id: 'techstack', title: 'Tech Stack' },
    { id: 'mlarch', title: 'ML Architecture' },
    { id: 'datapipeline', title: 'Data Pipeline' },
    { id: 'indicators', title: 'Technical Indicators' },
    { id: 'patterns', title: 'Pattern Detection' },
    { id: 'uicomponents', title: 'UI Components' },
    { id: 'sysarch', title: 'System Architecture' },
    { id: 'apiref', title: 'API Reference' },
    { id: 'futurescope', title: 'Future Scope' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
      
      const scrollPosition = window.scrollY + 100;
      let currentSection = sections[0].id;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          currentSection = section.id;
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleAccordion = (id) => {
    setExpandedAccordion(expandedAccordion === id ? null : id);
  };

  const renderSectionHeader = (number, title) => (
    <div className="flex items-center gap-3 mb-6">
      <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
        {number < 10 ? `0${number}` : number}
      </span>
      <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
    </div>
  );

  return (
    <div className="bg-[#0A0E1A] min-h-screen text-slate-100 pb-16">
      <div className="max-w-5xl mx-auto px-6 py-10 flex gap-10 items-start">
        
        {/* STICKY TABLE OF CONTENTS */}
        <div className="hidden lg:block sticky top-6 w-56 flex-shrink-0">
          <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-4">
            <h3 className="text-slate-500 text-xs uppercase tracking-widest mb-3 font-bold">Contents</h3>
            <ul className="space-y-1">
              {sections.map((sec, i) => (
                <li key={sec.id}>
                  <button
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left text-sm py-1.5 pl-3 border-l-2 transition-colors cursor-pointer ${activeSection === sec.id ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-slate-400 hover:text-blue-400'}`}
                  >
                    {i + 1}. {sec.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <div className="flex-1 min-w-0">
          
          {/* SECTION 0 — Hero Banner */}
          <div className="bg-gradient-to-br from-blue-900/40 via-violet-900/30 to-slate-900 border border-blue-500/30 rounded-3xl p-10 mb-10 text-center">
            <div className="text-6xl mb-4">📈</div>
            <h1 className="text-5xl font-black text-white">StockSense AI</h1>
            <p className="text-xl text-slate-300 mt-2">Real-Time Stock Market Analysis using LSTM</p>
            
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <span className="bg-blue-600 px-3 py-1 rounded-full text-xs font-bold text-white">v2.0 BETA</span>
              <span className="bg-violet-600 px-3 py-1 rounded-full text-xs font-bold text-white">LSTM Model</span>
              <span className="bg-emerald-700 px-3 py-1 rounded-full text-xs font-bold text-white">NSE Stocks</span>
              <span className="bg-orange-700 px-3 py-1 rounded-full text-xs font-bold text-white">FastAPI</span>
              <span className="bg-cyan-700 px-3 py-1 rounded-full text-xs font-bold text-white">React</span>
            </div>
            
            <div className="w-full border-t border-blue-500/20 mt-8 mb-6"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-1">130+</div>
                <div className="text-slate-400 text-sm font-semibold">Complete Universe</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-1">15+</div>
                <div className="text-slate-400 text-sm font-semibold">Chart Recognition</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-1">20+</div>
                <div className="text-slate-400 text-sm font-semibold">Technical Analysis</div>
              </div>
            </div>
            
            <p className="text-slate-500 text-sm font-medium">Built with TensorFlow · FastAPI · React · MongoDB</p>
          </div>

          {/* SECTION 1 — Problem Statement */}
          <div id="problem" className="mb-12 scroll-mt-24">
            {renderSectionHeader(1, 'Problem Statement')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
                <div className="text-2xl mb-3">⚠️</div>
                <h3 className="text-lg font-bold text-red-200 mb-4">Why Traditional Methods Fail</h3>
                <ul className="space-y-3 text-slate-300 text-sm">
                  <li className="flex items-start"><span className="text-red-500 mr-2">•</span> Linear Regression ignores non-linear volatility</li>
                  <li className="flex items-start"><span className="text-red-500 mr-2">•</span> ARIMA models fail on complex market patterns</li>
                  <li className="flex items-start"><span className="text-red-500 mr-2">•</span> Standard Neural Networks suffer from "amnesia" — they only see today's data, not historical context</li>
                  <li className="flex items-start"><span className="text-red-500 mr-2">•</span> Manual technical analysis is slow and subjective</li>
                </ul>
              </div>
              <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-6">
                <div className="text-2xl mb-3">✅</div>
                <h3 className="text-lg font-bold text-emerald-200 mb-4">The LSTM Advantage</h3>
                <ul className="space-y-3 text-slate-300 text-sm">
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> LSTM contains internal memory cells and forget gates</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Reads 60-day rolling sequences for long-term context</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Combines price data with 8 technical features</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Predicts next-day closing price with confidence score</li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2">•</span> Detects 15 chart patterns automatically</li>
                </ul>
              </div>
            </div>
          </div>

          {/* SECTION 2 — Technology Stack */}
          <div id="techstack" className="mb-12 scroll-mt-24">
            {renderSectionHeader(2, 'Technology Stack')}
            
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6 mb-4">
              <h3 className="text-blue-400 font-bold text-lg mb-4">🖥️ Frontend Layer</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {['React 18', 'Vite 5', 'TailwindCSS', 'Recharts', 'Framer Motion', 'Lucide React', 'React Router v6'].map(t => (
                  <span key={t} className="bg-blue-900/50 text-blue-300 text-xs px-3 py-1 rounded-full font-mono">{t}</span>
                ))}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                React uses a Virtual DOM allowing updates to only the changed screen elements without full page reloads — essential for financial dashboards with live prices. Vite provides exponentially faster build times than Create-React-App. TailwindCSS enables rapid styling with a Bloomberg Terminal-inspired dark palette. Recharts renders crisp SVG financial charts. Framer Motion adds smooth micro-animations.
              </p>
            </div>

            <div className="bg-teal-900/20 border border-teal-500/30 rounded-2xl p-6 mb-4">
              <h3 className="text-teal-400 font-bold text-lg mb-4">⚙️ Backend / API Gateway Layer</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Node.js', 'Express.js', 'Mongoose', 'MongoDB Atlas', 'WebSocket', 'node-cron', 'helmet', 'cors'].map(t => (
                  <span key={t} className="bg-teal-900/50 text-teal-300 text-xs px-3 py-1 rounded-full font-mono">{t}</span>
                ))}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Node.js is asynchronous — handles hundreds of simultaneous requests without blocking. Express acts as a secure API Gateway between the user and the heavy Python ML server, protecting it from direct traffic. MongoDB is NoSQL (document-based) which perfectly handles flexible ML prediction payloads — some predictions have 2 patterns, others have 5, some have pending actual prices.
              </p>
            </div>

            <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
              <h3 className="text-purple-400 font-bold text-lg mb-4">🧠 Machine Learning Layer</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Python 3.11', 'FastAPI', 'TensorFlow 2.15', 'Keras', 'scikit-learn', 'yfinance', 'pandas', 'numpy', 'ta library', 'scipy'].map(t => (
                  <span key={t} className="bg-purple-900/50 text-purple-300 text-xs px-3 py-1 rounded-full font-mono">{t}</span>
                ))}
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Python is the undisputed standard for ML/AI. FastAPI is chosen over Flask because it supports async programming and auto-generates Swagger docs. TensorFlow/Keras provides production-grade LSTM layers. yfinance scrapes live NSE stock data free of charge with no API keys required. The ta library computes 20+ indicators with a single function call.
              </p>
            </div>
          </div>

          {/* SECTION 3 — ML Architecture */}
          <div id="mlarch" className="mb-12 scroll-mt-24">
            {renderSectionHeader(3, 'ML Architecture')}
            
            <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-8 mb-6">
              <div className="flex flex-col items-center">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center w-full max-w-sm">
                  <div className="font-bold text-slate-200 text-sm mb-1">INPUT: (60 days × 9 features)</div>
                  <div className="text-xs text-slate-400">Close Open High Low Vol<br/>RSI MACD SMA20 Bollinger%B</div>
                </div>
                <div className="border-l-2 border-dashed border-blue-500/40 h-6 mx-auto w-0"></div>
                
                <div className="bg-blue-900/50 border border-blue-500/50 rounded-xl p-4 text-center w-full max-w-sm">
                  <div className="font-bold text-slate-200 text-sm mb-1">Bidirectional LSTM (128 units)</div>
                  <div className="text-xs text-slate-400">return_sequences=True<br/>Reads sequence FORWARD + BACKWARD</div>
                </div>
                <div className="border-l-2 border-dashed border-blue-500/40 h-6 mx-auto w-0"></div>
                
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center w-full max-w-sm">
                  <div className="font-bold text-slate-200 text-sm mb-1">Dropout (0.2)</div>
                  <div className="text-xs text-slate-400">Prevents overfitting</div>
                </div>
                <div className="border-l-2 border-dashed border-blue-500/40 h-6 mx-auto w-0"></div>
                
                <div className="bg-violet-900/50 border border-violet-500/50 rounded-xl p-4 text-center w-full max-w-sm">
                  <div className="font-bold text-slate-200 text-sm mb-1">LSTM Layer 2 (64 units)</div>
                  <div className="text-xs text-slate-400">return_sequences=False<br/>Compresses to single vector</div>
                </div>
                <div className="border-l-2 border-dashed border-blue-500/40 h-6 mx-auto w-0"></div>
                
                <div className="bg-emerald-900/50 border border-emerald-500/50 rounded-xl p-4 text-center w-full max-w-sm">
                  <div className="font-bold text-slate-200 text-sm mb-1">Dense (16, ReLU) → Dense (1)</div>
                  <div className="text-xs text-emerald-300 font-bold mt-1">OUTPUT: Predicted Close Price ₹</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl overflow-hidden mb-6">
              <table className="w-full text-left">
                <tbody className="divide-y divide-[#1E2D4F]">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-400 bg-[#141D35] w-1/3">Loss Function</td>
                    <td className="px-6 py-3 text-sm text-slate-200 font-mono">Huber (robust to outliers)</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-400 bg-[#141D35]">Optimizer</td>
                    <td className="px-6 py-3 text-sm text-slate-200 font-mono">Adam lr=0.001</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-400 bg-[#141D35]">Max Epochs</td>
                    <td className="px-6 py-3 text-sm text-slate-200 font-mono">50 (Early Stopping patience=8)</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-400 bg-[#141D35]">Batch Size</td>
                    <td className="px-6 py-3 text-sm text-slate-200 font-mono">32</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-400 bg-[#141D35]">Validation Split</td>
                    <td className="px-6 py-3 text-sm text-slate-200 font-mono">15%</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-400 bg-[#141D35]">Sequence Length</td>
                    <td className="px-6 py-3 text-sm text-slate-200 font-mono">60 trading days</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-400 bg-[#141D35]">Train/Test Split</td>
                    <td className="px-6 py-3 text-sm text-slate-200 font-mono">80% / 20% chronological</td>
                  </tr>
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm text-slate-400 bg-[#141D35]">Model Cache</td>
                    <td className="px-6 py-3 text-sm text-slate-200 font-mono">12 hours (skips retraining)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-5">
              <h4 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">⚡ Why Huber Loss?</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Stock data contains extreme outliers (earnings surprises, market crashes). MSE (Mean Squared Error) squares the error so one massive outlier dominates the entire loss function and ruins the weights. Huber loss behaves like MSE for small errors but like MAE for large ones — far more robust for financial time series.
              </p>
            </div>
          </div>

          {/* SECTION 4 — Data Pipeline */}
          <div id="datapipeline" className="mb-12 scroll-mt-24">
            {renderSectionHeader(4, 'Data Pipeline')}
            
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {[
                "yfinance download 2Y OHLCV",
                "Flatten MultiIndex columns",
                "Drop NaN rows (ffill + bfill)",
                "Add 8 technical features",
                "MinMaxScaler normalize [0,1]",
                "Build 60-day sequences",
                "80/20 chronological split",
                "Train Bidirectional LSTM",
                "Inverse transform → ₹ price"
              ].map((step, i, arr) => (
                <React.Fragment key={i}>
                  <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-xl p-3 flex-1 min-w-[140px] text-center shadow-sm">
                    <div className="text-[10px] text-blue-400 font-bold mb-1 uppercase tracking-widest">Step {i<9?'0':''}{i+1}</div>
                    <div className="text-xs font-semibold text-slate-200">{step}</div>
                  </div>
                  {i < arr.length - 1 && <div className="text-slate-600 font-bold">→</div>}
                </React.Fragment>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-100 mb-4 border-b border-[#1E2D4F] pb-3">9 Input Features</h3>
                <ul className="space-y-3">
                  {[
                    {name: 'Close Price', type: 'Price'},
                    {name: 'Open Price', type: 'Price'},
                    {name: 'High Price', type: 'Price'},
                    {name: 'Low Price', type: 'Price'},
                    {name: 'Volume', type: 'Volume'},
                    {name: 'RSI (14)', type: 'Momentum'},
                    {name: 'MACD line', type: 'Trend'},
                    {name: 'SMA (20)', type: 'Trend'},
                    {name: 'Bollinger %B', type: 'Volatility'}
                  ].map(f => {
                    let colorClass = 'bg-blue-900/50 text-blue-400';
                    if (f.type === 'Volume') colorClass = 'bg-orange-900/50 text-orange-400';
                    if (f.type === 'Momentum') colorClass = 'bg-purple-900/50 text-purple-400';
                    if (f.type === 'Trend') colorClass = 'bg-emerald-900/50 text-emerald-400';
                    if (f.type === 'Volatility') colorClass = 'bg-yellow-900/50 text-yellow-400';
                    
                    return (
                      <li key={f.name} className="flex items-center justify-between">
                        <span className="text-slate-300 text-sm font-medium">{f.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${colorClass}`}>{f.type}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-100 mb-4 border-b border-[#1E2D4F] pb-3">Evaluation Metrics</h3>
                <div className="space-y-4">
                  {[
                    {name: 'MAPE', formula: 'mean(|actual-pred|/actual)×100', desc: '% error'},
                    {name: 'RMSE', formula: '√mean((actual-pred)²)', desc: '₹ error'},
                    {name: 'MAE', formula: 'mean(|actual-pred|)', desc: '₹ error'},
                    {name: 'R²', formula: '1 - SS_res/SS_tot', desc: 'fit quality'},
                    {name: 'Confidence', formula: '100 - MAPE×5, cap 98', desc: 'user score'}
                  ].map(m => (
                    <div key={m.name} className="flex flex-col">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-blue-400 font-bold text-sm">{m.name}</span>
                        <span className="text-slate-500 text-xs italic">{m.desc}</span>
                      </div>
                      <code className="bg-[#141D35] p-2 rounded text-xs text-slate-300 font-mono border border-[#1E2D4F]">
                        {m.formula}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5 — Technical Indicators */}
          <div id="indicators" className="mb-12 scroll-mt-24">
            {renderSectionHeader(5, 'Technical Indicators')}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                {name: 'Trend', color: 'border-l-emerald-500', items: ['SMA 20', 'SMA 50', 'SMA 200', 'EMA 12', 'EMA 26', 'MACD line', 'Signal line', 'Histogram']},
                {name: 'Momentum', color: 'border-l-purple-500', items: ['RSI (14)', 'Stochastic %K/%D', 'Williams %R (14)', 'CCI (20)']},
                {name: 'Volatility', color: 'border-l-yellow-500', items: ['Bollinger Bands upper/mid/lower/%B', 'ATR (14)', 'Keltner Channels']},
                {name: 'Volume', color: 'border-l-orange-500', items: ['OBV (On-Balance Volume)', 'VWAP (Volume Weighted Avg Price)', 'MFI (Money Flow Index 14)']},
                {name: 'Trend Strength', color: 'border-l-blue-500', items: ['ADX (14)', '+DI', '-DI (DMI)']}
              ].map(cat => (
                <div key={cat.name} className={`bg-[#0F1629] border border-[#1E2D4F] border-l-4 ${cat.color} rounded-xl p-4`}>
                  <h4 className="text-slate-200 font-bold mb-3">{cat.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map(item => (
                      <span key={item} className="bg-[#141D35] text-slate-300 text-[11px] px-2.5 py-1 rounded-md font-mono border border-[#1E2D4F]/50">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl overflow-hidden">
              <h3 className="bg-[#141D35] text-slate-200 font-bold p-4 border-b border-[#1E2D4F]">Signal Logic Mapping</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#141D35]/50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3 border-b border-[#1E2D4F]">Indicator</th>
                      <th className="px-6 py-3 border-b border-[#1E2D4F]">Condition</th>
                      <th className="px-6 py-3 border-b border-[#1E2D4F]">Signal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2D4F]">
                    {[
                      {ind: 'RSI', cond: 'RSI < 30', sig: 'BUY (Oversold)', color: 'text-emerald-400'},
                      {ind: 'RSI', cond: 'RSI > 70', sig: 'SELL (Overbought)', color: 'text-red-400'},
                      {ind: 'MACD', cond: 'MACD > Signal AND > 0', sig: 'BUY', color: 'text-emerald-400'},
                      {ind: 'MACD', cond: 'MACD < Signal AND < 0', sig: 'SELL', color: 'text-red-400'},
                      {ind: 'ADX/DMI', cond: 'ADX > 25 AND +DI > -DI', sig: 'BUY (Strong Uptrend)', color: 'text-emerald-400'},
                      {ind: 'SMA Cross', cond: 'Price > SMA20 > SMA50', sig: 'BUY', color: 'text-emerald-400'},
                      {ind: 'MFI', cond: 'MFI < 20', sig: 'BUY', color: 'text-emerald-400'},
                      {ind: 'MFI', cond: 'MFI > 80', sig: 'SELL', color: 'text-red-400'},
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/5">
                        <td className="px-6 py-3 text-slate-300 font-bold">{row.ind}</td>
                        <td className="px-6 py-3 text-slate-400 font-mono text-xs">{row.cond}</td>
                        <td className={`px-6 py-3 font-bold text-xs ${row.color}`}>{row.sig}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECTION 6 — Pattern Detection */}
          <div id="patterns" className="mb-12 scroll-mt-24">
            {renderSectionHeader(6, 'Pattern Detection')}
            
            <p className="text-slate-400 text-sm leading-relaxed mb-6 bg-[#0F1629] p-4 rounded-xl border border-[#1E2D4F] border-l-4 border-l-blue-500">
              <code className="text-blue-400">scipy.signal.argrelextrema</code> detects local peaks and troughs. Geometric rules are then applied to classify the pattern type, calculate confidence, and derive target price and stop-loss levels.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                {name: 'Head & Shoulders', type: 'Bearish', desc: '3 peaks, middle highest, shoulders within 2%'},
                {name: 'Inverse H&S', type: 'Bullish', desc: '3 troughs, middle lowest, neckline breakout'},
                {name: 'Double Top', type: 'Bearish', desc: '2 peaks within 1.5%, valley ≥3% below'},
                {name: 'Double Bottom', type: 'Bullish', desc: '2 troughs within 1.5%, peak ≥3% above'},
                {name: 'Triple Top', type: 'Bearish', desc: '3 matching peaks, separated by valleys'},
                {name: 'Triple Bottom', type: 'Bullish', desc: '3 matching troughs, separated by peaks'},
                {name: 'Ascending Triangle', type: 'Bullish', desc: 'Flat resistance + rising support via linreg'},
                {name: 'Descending Triangle', type: 'Bearish', desc: 'Flat support + falling resistance'},
                {name: 'Symmetrical Triangle', type: 'Neutral', desc: 'Converging trendlines — awaiting breakout'},
                {name: 'Rising Wedge', type: 'Bearish', desc: 'Both lines rising but converging'},
                {name: 'Falling Wedge', type: 'Bullish', desc: 'Both lines falling but converging'},
                {name: 'Bull Flag', type: 'Bullish', desc: 'Sharp upward pole + slight downward channel'},
                {name: 'Bear Flag', type: 'Bearish', desc: 'Sharp downward pole + slight upward channel'},
                {name: 'Cup & Handle', type: 'Bullish', desc: 'Rounded bottom >30 bars + short handle'},
                {name: 'Support & Resistance', type: 'Neutral', desc: 'Clustered local minima/maxima ranked'}
              ].map(p => {
                let badge = 'bg-slate-800 text-slate-400';
                let icon = '🟡';
                if (p.type === 'Bullish') { badge = 'bg-emerald-900/30 text-emerald-400'; icon = '🟢'; }
                if (p.type === 'Bearish') { badge = 'bg-red-900/30 text-red-400'; icon = '🔴'; }

                return (
                  <div key={p.name} className="bg-[#0F1629] border border-[#1E2D4F] rounded-xl p-4 hover:border-blue-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-slate-200 text-sm">{p.name}</div>
                      <div className={`text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1 ${badge}`}>{icon} {p.type}</div>
                    </div>
                    <div className="text-xs text-slate-500 leading-snug">{p.desc}</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
              <span className="text-blue-400 font-bold mr-2 text-sm">Output Payload:</span>
              <code className="text-slate-300 text-xs">pattern_name, pattern_type, confidence (0-1), start_date, end_date, target_price, stop_loss, description</code>
            </div>
          </div>

          {/* SECTION 7 — UI Components & Why */}
          <div id="uicomponents" className="mb-12 scroll-mt-24">
            {renderSectionHeader(7, 'UI Components & Why')}
            
            <div className="space-y-3">
              {[
                {
                  id: 'ui1',
                  icon: '🏷️',
                  title: 'BUY/HOLD/SELL Verdict Badge',
                  desc: 'Immediate human-readable translation of complex math.',
                  content: <>Raw data (RSI is 42, MACD crossed) means nothing to a beginner investor. The verdict badge is an immediate human-readable translation of complex mathematics. Scored out of 100 using 5 weighted signal categories: LSTM Prediction (30%), Technical Indicators (30%), Chart Patterns (20%), Support/Resistance (10%), Model Quality (10%).
                  <br/><br/>
                  <div className="bg-[#141D35] border border-[#1E2D4F] p-3 rounded-lg text-xs font-mono grid grid-cols-3 gap-4">
                    <div className="text-emerald-400">68-100 → BUY</div>
                    <div className="text-yellow-400">52-67 → HOLD</div>
                    <div className="text-red-400">0-51 → SELL</div>
                  </div></>
                },
                {
                  id: 'ui2',
                  icon: '📊',
                  title: 'Normalized Price Chart (Rebased to 100)',
                  desc: 'Fair visual comparison regardless of absolute stock price.',
                  content: 'If you plot a ₹3,850 stock (TCS) and a ₹480 stock (Wipro) together, the ₹480 stock looks like a flat dead line because the Y-axis scale is dominated by the larger price. Rebasing all stocks to 100 at the start date compares their percentage returns fairly. This is the academically correct method used by institutional portfolio managers worldwide.'
                },
                {
                  id: 'ui3',
                  icon: '🔲',
                  title: 'Correlation Matrix Heatmap',
                  desc: 'Visual warning system for portfolio diversification.',
                  content: <>Teaches users about portfolio diversification. If two stocks show 0.95 correlation they move nearly identically — if one crashes, both crash. A well-diversified portfolio should hold stocks with low correlation (&lt;0.5). The heatmap visually warns users if their selected stocks are too similar.
                  <br/><br/>
                  <div className="flex flex-wrap gap-3 text-xs font-bold uppercase">
                    <span className="text-red-400 bg-red-900/20 px-2 py-1 rounded">0.0-0.3 Diversified</span>
                    <span className="text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded">0.3-0.6 Moderate</span>
                    <span className="text-blue-400 bg-blue-900/20 px-2 py-1 rounded">0.6-0.8 High</span>
                    <span className="text-emerald-400 bg-emerald-900/20 px-2 py-1 rounded">0.8-1.0 Very High</span>
                  </div></>
                },
                {
                  id: 'ui4',
                  icon: '📥',
                  title: 'Export to CSV',
                  desc: 'Portability for quantitative analysts.',
                  content: 'Serious traders always want to port their data into Excel or Python for custom backtesting. The CSV contains all prediction fields: symbol, predicted price, actual price, error rate, trend, confidence, verdict, MAPE, R², and detected patterns. This is a mandatory feature for any professional fintech tool targeting quantitative analysts.'
                }
              ].map(item => {
                const isOpen = expandedAccordion === item.id;
                return (
                  <div key={item.id} className="bg-[#0F1629] border border-[#1E2D4F] rounded-xl overflow-hidden">
                    <button 
                      onClick={() => toggleAccordion(item.id)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="font-bold text-slate-200">{item.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                      <div className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </button>
                    <div 
                      className={`px-5 text-sm text-slate-400 leading-relaxed overflow-hidden transition-all duration-300 ease-in-out`}
                      style={{ maxHeight: isOpen ? '500px' : '0', paddingBottom: isOpen ? '1.25rem' : '0' }}
                    >
                      <div className="pt-2 border-t border-[#1E2D4F]">
                        {item.content}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 8 — System Architecture */}
          <div id="sysarch" className="mb-12 scroll-mt-24">
            {renderSectionHeader(8, 'System Architecture')}
            
            <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-8 mb-6 overflow-x-auto flex justify-center">
              <div className="flex flex-col items-center min-w-[500px]">
                
                {/* Client Layer */}
                <div className="bg-slate-800 border-2 border-slate-600 rounded-xl p-4 w-64 text-center shadow-lg relative z-10">
                  <div className="font-bold text-slate-100 mb-1">User Browser</div>
                  <div className="text-xs text-slate-400">React + Vite</div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-1">Port 5173</div>
                </div>

                <div className="flex flex-col items-center my-2 text-slate-500">
                  <div className="h-6 border-l-2 border-dashed border-blue-500/50"></div>
                  <div className="text-[10px] font-bold bg-[#0A0E1A] px-2 -my-2 z-10 text-blue-400">Axios HTTP / WS</div>
                  <div className="h-6 border-l-2 border-dashed border-blue-500/50 flex items-end justify-center"><div className="w-2 h-2 border-b-2 border-r-2 border-blue-500/50 transform rotate-45 mb-[-4px]"></div></div>
                </div>

                {/* API Gateway Layer */}
                <div className="bg-teal-900/50 border-2 border-teal-500/50 rounded-xl p-4 w-64 text-center shadow-lg relative z-10">
                  <div className="font-bold text-teal-100 mb-1">Node.js API Gateway</div>
                  <div className="text-xs text-teal-200/70">Express.js</div>
                  <div className="text-[10px] text-teal-400 font-mono mt-1">Port 5000</div>
                </div>

                <div className="flex w-full max-w-sm justify-between my-2 text-slate-500 px-8 relative">
                  <div className="absolute top-0 left-1/2 w-full max-w-[200px] -translate-x-1/2 h-4 border-b-2 border-l-2 border-r-2 border-dashed border-slate-600 rounded-b-lg"></div>
                  
                  <div className="flex flex-col items-center w-full relative pt-4">
                    <div className="flex w-full justify-around">
                      <div className="flex flex-col items-center">
                        <div className="text-[10px] font-bold text-orange-400 bg-[#0A0E1A] px-2 mb-1 z-10">Axios</div>
                        <div className="h-6 border-l-2 border-dashed border-orange-500/50 flex items-end justify-center"><div className="w-2 h-2 border-b-2 border-r-2 border-orange-500/50 transform rotate-45 mb-[-4px]"></div></div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="text-[10px] font-bold text-emerald-400 bg-[#0A0E1A] px-2 mb-1 z-10">Mongoose</div>
                        <div className="h-6 border-l-2 border-dashed border-emerald-500/50 flex items-end justify-center"><div className="w-2 h-2 border-b-2 border-r-2 border-emerald-500/50 transform rotate-45 mb-[-4px]"></div></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Layer */}
                <div className="flex gap-6 z-10 w-full justify-center">
                  <div className="bg-orange-900/30 border-2 border-orange-500/40 rounded-xl p-4 w-40 text-center shadow-lg">
                    <div className="font-bold text-orange-100 mb-1">Python ML</div>
                    <div className="text-xs text-orange-200/70">FastAPI</div>
                    <div className="text-[10px] text-orange-400 font-mono mt-1">Port 8000</div>
                  </div>
                  
                  <div className="bg-emerald-900/30 border-2 border-emerald-500/40 rounded-xl p-4 w-40 text-center shadow-lg">
                    <div className="font-bold text-emerald-100 mb-1">MongoDB</div>
                    <div className="text-xs text-emerald-200/70">Atlas Cloud</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-1">Storage</div>
                  </div>
                </div>

                <div className="flex flex-col items-center my-2 text-slate-500 -ml-44">
                  <div className="h-6 border-l-2 border-dashed border-slate-500/50"></div>
                  <div className="text-[10px] font-bold bg-[#0A0E1A] px-2 -my-2 z-10 text-slate-400">yfinance</div>
                  <div className="h-6 border-l-2 border-dashed border-slate-500/50 flex items-end justify-center"><div className="w-2 h-2 border-b-2 border-r-2 border-slate-500/50 transform rotate-45 mb-[-4px]"></div></div>
                </div>

                {/* External Layer */}
                <div className="bg-[#141D35] border-2 border-[#1E2D4F] rounded-xl p-3 w-40 text-center shadow-lg -ml-44 relative z-10">
                  <div className="font-bold text-slate-300 text-sm">Yahoo Finance</div>
                  <div className="text-[10px] text-slate-500">Live NSE Data</div>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Terminal 1 — ML Service</div>
                <div className="font-mono text-xs text-emerald-400 space-y-1">
                  <div>cd ml-service</div>
                  <div>pip install -r requirements.txt</div>
                  <div>uvicorn app.main:app --reload --port 8000</div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Terminal 2 — Node Backend</div>
                <div className="font-mono text-xs text-emerald-400 space-y-1">
                  <div>cd backend</div>
                  <div>npm install</div>
                  <div>npm run dev</div>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3">Terminal 3 — React Frontend</div>
                <div className="font-mono text-xs text-emerald-400 space-y-1">
                  <div>cd frontend</div>
                  <div>npm install</div>
                  <div>npm run dev</div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 9 — API Reference */}
          <div id="apiref" className="mb-12 scroll-mt-24">
            {renderSectionHeader(9, 'API Reference')}
            
            <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-[#1E2D4F] pb-2">Node.js Gateway APIs</h3>
            <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl overflow-x-auto mb-8">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#141D35] text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 border-b border-[#1E2D4F]">Method</th>
                    <th className="px-4 py-3 border-b border-[#1E2D4F]">Endpoint</th>
                    <th className="px-4 py-3 border-b border-[#1E2D4F]">Description</th>
                    <th className="px-4 py-3 border-b border-[#1E2D4F]">Body/Params</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2D4F]">
                  {[
                    {m: 'POST', e: '/api/predict', d: 'Run LSTM prediction', p: '{stockSymbol, period}'},
                    {m: 'GET', e: '/api/history', d: 'Fetch past results', p: '?limit=20&symbol='},
                    {m: 'POST', e: '/api/holding-report', d: 'Holding P&L forecast', p: '{symbol, buy_price, ...}'},
                    {m: 'POST', e: '/api/alerts', d: 'Create price alert', p: '{symbol, targetPrice, condition}'},
                    {m: 'GET', e: '/api/alerts', d: 'Get all alerts', p: '—'},
                    {m: 'GET', e: '/api/compare', d: 'Compare stocks', p: '?symbols=A,B,C'},
                    {m: 'GET', e: '/api/health', d: 'Health check', p: '—'}
                  ].map((api, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-bold"><span className={`text-[10px] px-2 py-0.5 rounded text-white ${api.m === 'POST' ? 'bg-blue-600' : 'bg-emerald-700'}`}>{api.m}</span></td>
                      <td className="px-4 py-3 font-mono text-slate-300">{api.e}</td>
                      <td className="px-4 py-3 text-slate-400">{api.d}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{api.p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-bold text-slate-200 mb-4 border-b border-[#1E2D4F] pb-2">Python ML APIs</h3>
            <div className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#141D35] text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 border-b border-[#1E2D4F]">Method</th>
                    <th className="px-4 py-3 border-b border-[#1E2D4F]">Endpoint</th>
                    <th className="px-4 py-3 border-b border-[#1E2D4F]">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2D4F]">
                  {[
                    {m: 'POST', e: '/predict', d: 'Full LSTM prediction pipeline'},
                    {m: 'POST', e: '/holding-report', d: 'Time-based P&L report'},
                    {m: 'GET', e: '/stock-data', d: 'Raw OHLCV + indicators'},
                    {m: 'POST', e: '/train', d: 'Force model retrain'},
                    {m: 'GET', e: '/patterns', d: 'Pattern detection only'},
                    {m: 'GET', e: '/search', d: 'Stock universe search'},
                    {m: 'GET', e: '/health', d: 'Health check'}
                  ].map((api, i) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-bold"><span className={`text-[10px] px-2 py-0.5 rounded text-white ${api.m === 'POST' ? 'bg-blue-600' : 'bg-emerald-700'}`}>{api.m}</span></td>
                      <td className="px-4 py-3 font-mono text-slate-300">{api.e}</td>
                      <td className="px-4 py-3 text-slate-400">{api.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 10 — Future Scope */}
          <div id="futurescope" className="scroll-mt-24">
            {renderSectionHeader(10, 'Future Scope')}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {icon: '🌐', title: 'Real-time WebSocket prices', color: 'border-l-blue-500', desc: 'Replace simulated random walk with actual NSE live feed via WebSocket for true real-time alerts'},
                {icon: '🤖', title: 'LLM-Powered AI Reports', color: 'border-l-violet-500', desc: 'Integrate GPT-4 or Claude to generate natural language investment thesis reports for each stock'},
                {icon: '📰', title: 'Sentiment Analysis', color: 'border-l-yellow-500', desc: 'Scrape news headlines and social media, run NLP sentiment scoring, and feed as LSTM input feature'},
                {icon: '📱', title: 'Mobile App', color: 'border-l-emerald-500', desc: 'React Native port for iOS and Android with push notifications when price alerts trigger'},
                {icon: '🔄', title: 'Multi-timeframe LSTM', color: 'border-l-orange-500', desc: 'Train separate models for 1-day, 1-week, and 1-month horizons and ensemble their predictions'},
                {icon: '🌍', title: 'Global Markets', color: 'border-l-red-500', desc: 'Extend beyond NSE to NYSE, NASDAQ, LSE, SGX using the same yfinance + LSTM pipeline'},
                {icon: '💼', title: 'Portfolio Optimizer', color: 'border-l-cyan-500', desc: 'Use Modern Portfolio Theory (Markowitz) to suggest optimal allocation weights across stocks'},
                {icon: '🧪', title: 'Backtesting Engine', color: 'border-l-pink-500', desc: 'Simulate historical BUY/SELL signals and compute actual returns to validate model performance'}
              ].map((f, i) => (
                <div key={i} className={`bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-5 border-l-4 ${f.color}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{f.icon}</span>
                    <h4 className="font-bold text-slate-200 text-sm">{f.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-8">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 11 — Disclaimer Footer */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-2xl p-6 mt-16 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-yellow-500 mb-4 uppercase tracking-widest">Investment Disclaimer</h3>
            <p className="text-yellow-200/80 text-sm leading-relaxed max-w-2xl mx-auto space-y-4">
              <span className="block">StockSense AI is an academic and educational project built to demonstrate the application of LSTM neural networks to financial time series data. All predictions, recommendations, and analysis generated by this platform are AI-generated and for informational purposes only.</span>
              <span className="block">This platform does NOT constitute financial advice. Stock markets are inherently unpredictable and past performance is not indicative of future results. Never invest money you cannot afford to lose.</span>
              <span className="block font-bold">Always consult a SEBI-registered investment advisor before making any investment decisions.</span>
            </p>
          </div>

        </div>
      </div>

      {/* BACK TO TOP BUTTON */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all hover:-translate-y-1"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
