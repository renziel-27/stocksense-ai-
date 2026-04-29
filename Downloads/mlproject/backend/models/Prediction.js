const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  stockSymbol: { type: String, required: true, uppercase: true },
  date: { type: Date, default: Date.now },
  currentPrice: Number,
  predictedPrice: Number,
  predictedChangePct: Number,
  actualPrice: Number,
  errorRate: Number,
  trend: { type: String, enum: ['Bullish', 'Bearish'] },
  confidence: Number,
  indicators: {
    rsi: Number, macd: Number, adx: Number,
    sma20: Number, sma50: Number, atr: Number,
    bollingerUpper: Number, bollingerLower: Number,
    vwap: Number
  },
  modelMetrics: {
    mape: Number, rmse: Number, mae: Number,
    rSquared: Number, trainingSamples: Number
  },
  patternsDetected: [String],
  aiSummary: String,
  recommendation: {
    verdict:       { type: String, enum: ['BUY', 'HOLD', 'SELL'] },
    final_score:   Number,
    risk_level:    { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'] },
    entry_price:   Number,
    target_price:  Number,
    stop_loss:     Number,
    potential_return: Number,
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', predictionSchema);
