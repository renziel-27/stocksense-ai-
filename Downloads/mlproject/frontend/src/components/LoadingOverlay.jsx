import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0E1A]/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0F1629] border border-[#1E2D4F] rounded-2xl p-8 flex flex-col items-center shadow-2xl shadow-blue-500/10"
      >
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-[#1E2D4F] rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h3 className="text-slate-200 font-semibold mb-2">Analyzing Deep Sequences...</h3>
        <p className="text-slate-400 text-sm max-w-[250px] text-center">
          Running Bidirectional LSTM across 2 years of market data.
        </p>
      </motion.div>
    </div>
  );
}
