import { useState, useEffect } from 'react';

export default function LoadingSpinner() {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    "Fetching historical stock data...",
    "Preprocessing time series sequences...",
    "Loading LSTM model via background task...",
    "Generating predictions & calculating indicators...",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [messages.length]);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center flex-col">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
        <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
        <div className="absolute inset-2 border-4 border-slate-800 rounded-full" />
        <div className="absolute inset-2 border-4 border-violet-500 rounded-full border-b-transparent animate-[spin_1.5s_linear_infinite_reverse]" />
      </div>
      <h3 className="text-white text-xl font-bold mt-8 mb-2">Training LSTM model</h3>
      <p className="text-slate-400 max-w-sm text-center h-6 transition-all duration-300">
        {messages[messageIndex]}
      </p>
      <p className="text-slate-500 text-sm mt-4">This may take 30-60 seconds to train.</p>
    </div>
  );
}
