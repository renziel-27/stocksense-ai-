const mongoose = require('mongoose');

const patternSchema = new mongoose.Schema({
  stockSymbol: String,
  patternName: String,
  patternType: { type: String, enum: ['bullish','bearish','neutral'] },
  confidence: Number,
  startDate: Date, 
  endDate: Date,
  description: String,
  targetPrice: Number,
  stopLoss: Number,
  detected: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pattern', patternSchema);
