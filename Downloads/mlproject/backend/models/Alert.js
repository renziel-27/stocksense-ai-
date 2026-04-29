const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  symbol: { type: String, required: true, uppercase: true },
  targetPrice: { type: Number, required: true },
  condition: { type: String, enum: ['above','below'], required: true },
  active: { type: Boolean, default: true },
  triggered: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
