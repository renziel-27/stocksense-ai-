const axios = require('axios');
const Prediction = require('../models/Prediction');
const Pattern = require('../models/Pattern');
const Alert = require('../models/Alert');

const PYTHON_ML_URL = process.env.PYTHON_ML_URL || 'http://localhost:8000';

exports.getPrediction = async (req, res, next) => {
  try {
    const { stockSymbol, period = '1y' } = req.body;
    
    if (!stockSymbol) {
      return res.status(400).json({ error: 'stockSymbol is required' });
    }
    
    const response = await axios.post(
      `${PYTHON_ML_URL}/predict`,
      { symbol: stockSymbol.toUpperCase().trim(), period },
      { timeout: 180000 } // 3 min timeout for training
    );
    
    // Save to MongoDB (non-blocking)
    savePredictionRecord(response.data).catch(console.error);
    savePatternsRecord(response.data).catch(console.error);
    checkAlerts(stockSymbol, response.data.current_price).catch(console.error);

    return res.json(response.data);
  } catch (error) {
    // BUG 9: Relay Python's error message to frontend exactly as generated
    const pythonError = error.response?.data?.error
                     || error.response?.data?.detail
                     || error.message
                     || 'Unknown ML service error';
    
    console.error('Predict error:', pythonError);
    return res.status(error.response?.status || 500).json({
      error: pythonError
    });
  }
};

async function savePredictionRecord(data) {
  if (mongoose.connection.readyState !== 1) return;
  const patternsName = data.patterns ? data.patterns.map(p => p.pattern_name) : [];
  await Prediction.create({
    stockSymbol: data.symbol,
    currentPrice: data.current_price,
    predictedPrice: data.predicted_price,
    predictedChangePct: data.predicted_change_pct,
    errorRate: data.error_rate,
    trend: data.trend,
    confidence: data.confidence,
    indicators: {
      rsi: data.indicators?.rsi,
      macd: data.indicators?.macd_line,
      adx: data.indicators?.adx,
      sma20: data.indicators?.sma20,
      sma50: data.indicators?.sma50,
      atr: data.indicators?.atr,
      bollingerUpper: data.indicators?.bollinger_upper,
      bollingerLower: data.indicators?.bollinger_lower,
      vwap: data.indicators?.vwap
    },
    modelMetrics: data.model_metrics,
    patternsDetected: patternsName,
    aiSummary: data.ai_summary,
    recommendation: {
      verdict:       data.recommendation?.verdict,
      final_score:   data.recommendation?.final_score,
      risk_level:    data.recommendation?.risk_level,
      entry_price:   data.recommendation?.entry_price,
      target_price:  data.recommendation?.target_price,
      stop_loss:     data.recommendation?.stop_loss,
      potential_return: data.recommendation?.potential_return,
    }
  });
}

async function savePatternsRecord(data) {
  if (mongoose.connection.readyState !== 1) return;
  if (!data.patterns) return;
  for (const p of data.patterns) {
    await Pattern.create({
      stockSymbol: data.symbol,
      patternName: p.pattern_name,
      patternType: p.pattern_type,
      confidence: p.confidence,
      startDate: new Date(p.start_date),
      endDate: new Date(p.end_date),
      description: p.description,
      targetPrice: p.target_price,
      stopLoss: p.stop_loss
    });
  }
}

async function checkAlerts(symbol, currentPrice) {}

const mongoose = require('mongoose');
