import axios from 'axios';

const nodeAPI = axios.create({
  baseURL: '/api',
  timeout: 300000, // 5 min — model training takes time
});

const mlAPI = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 300000,
});

// Transform raw API response into safe frontend shape
// with defaults for every field so no component ever
// reads from undefined
export function normalizePrediction(raw) {
  if (!raw || typeof raw !== 'object') return null;

  return {
    symbol:              raw.symbol               ?? 'N/A',
    current_price:       raw.current_price        ?? 0,
    predicted_price:     raw.predicted_price      ?? 0,
    predicted_change_pct: raw.predicted_change_pct ?? 0,
    trend:               raw.trend                ?? 'Neutral',
    confidence:          raw.confidence           ?? 0,
    error_rate:          raw.error_rate           ?? 0,
    ai_summary:          raw.ai_summary           ?? '',

    historical_data:     Array.isArray(raw.historical_data)
                           ? raw.historical_data : [],
    predictions_overlay: Array.isArray(raw.predictions_overlay)
                           ? raw.predictions_overlay : [],

    indicators: {
      rsi:              raw.indicators?.rsi              ?? null,
      macd:             raw.indicators?.macd             ?? null,
      macd_signal_line: raw.indicators?.macd_signal_line ?? null,
      macd_hist:        raw.indicators?.macd_hist        ?? null,
      sma20:            raw.indicators?.sma20            ?? null,
      sma50:            raw.indicators?.sma50            ?? null,
      sma200:           raw.indicators?.sma200           ?? null,
      bollinger_upper:  raw.indicators?.bollinger_upper  ?? null,
      bollinger_lower:  raw.indicators?.bollinger_lower  ?? null,
      bollinger_mid:    raw.indicators?.bollinger_mid    ?? null,
      adx:              raw.indicators?.adx              ?? null,
      atr:              raw.indicators?.atr              ?? null,
      vwap:             raw.indicators?.vwap             ?? null,
      rsi_signal:       raw.indicators?.rsi_signal       ?? 'NEUTRAL',
      macd_signal:      raw.indicators?.macd_signal      ?? 'NEUTRAL',
      adx_signal:       raw.indicators?.adx_signal       ?? 'Unknown',
      signals_summary:  Array.isArray(raw.indicators?.signals_summary)
                          ? raw.indicators.signals_summary : [],
      // Chart series arrays
      rsi_series:             raw.indicators?.rsi_series             ?? [],
      macd_series:            raw.indicators?.macd_series            ?? [],
      signal_series:          raw.indicators?.signal_series          ?? [],
      hist_series:            raw.indicators?.hist_series            ?? [],
      bollinger_upper_series: raw.indicators?.bollinger_upper_series ?? [],
      bollinger_lower_series: raw.indicators?.bollinger_lower_series ?? [],
      bollinger_mid_series:   raw.indicators?.bollinger_mid_series   ?? [],
      sma20_series:           raw.indicators?.sma20_series           ?? [],
      sma50_series:           raw.indicators?.sma50_series           ?? [],
      volume_series:          raw.indicators?.volume_series          ?? [],
      close_series:           raw.indicators?.close_series           ?? [],
      obv_series:             raw.indicators?.obv_series             ?? [],
      dates:                  raw.indicators?.dates                  ?? [],
    },

    patterns: Array.isArray(raw.patterns) ? raw.patterns : [],

    support_resistance: {
      support:    Array.isArray(raw.support_resistance?.support)
                    ? raw.support_resistance.support : [],
      resistance: Array.isArray(raw.support_resistance?.resistance)
                    ? raw.support_resistance.resistance : [],
    },

    model_metrics: {
      mape:             raw.model_metrics?.mape             ?? 0,
      rmse:             raw.model_metrics?.rmse             ?? 0,
      mae:              raw.model_metrics?.mae              ?? 0,
      r_squared:        raw.model_metrics?.r_squared        ?? 0,
      training_samples: raw.model_metrics?.training_samples ?? 0,
      test_samples:     raw.model_metrics?.test_samples     ?? 0,
      epochs_run:       raw.model_metrics?.epochs_run       ?? 0,
    },

    recommendation: {
      verdict:          raw.recommendation?.verdict          ?? 'HOLD',
      verdict_color:    raw.recommendation?.verdict_color    ?? 'yellow',
      final_score:      raw.recommendation?.final_score      ?? 50,
      action:           raw.recommendation?.action           ?? '',
      risk_level:       raw.recommendation?.risk_level       ?? 'MEDIUM',
      risk_note:        raw.recommendation?.risk_note        ?? '',
      scores:           raw.recommendation?.scores           ?? {},
      reasons:          Array.isArray(raw.recommendation?.reasons)
                          ? raw.recommendation.reasons : [],
      entry_price:      raw.recommendation?.entry_price      ?? 0,
      target_price:     raw.recommendation?.target_price     ?? 0,
      stop_loss:        raw.recommendation?.stop_loss        ?? null,
      potential_return: raw.recommendation?.potential_return ?? 0,
      potential_loss:   raw.recommendation?.potential_loss   ?? null,
      disclaimer:       raw.recommendation?.disclaimer       ?? '',
    },
  };
}

export async function fetchPrediction(stockSymbol, period = '1y') {
  try {
    // Call Node backend which proxies to Python
    const response = await nodeAPI.post('/predict', {
      stockSymbol,
      period,
    });
    return {
      data: normalizePrediction(response.data),
      error: null,
    };
  } catch (err) {
    const errorMsg =
      err.response?.data?.error  ||
      err.response?.data?.detail ||
      err.message                ||
      'Prediction failed. Please try again.';
    return { data: null, error: errorMsg };
  }
}

export async function fetchHistory(limit = 20, symbol = '') {
  try {
    const params = { limit };
    if (symbol) params.symbol = symbol;
    const response = await nodeAPI.get('/history', { params });
    return { data: response.data ?? [], error: null };
  } catch (err) {
    return { data: [], error: err.message };
  }
}

export async function saveAlert(alertData) {
  try {
    const response = await nodeAPI.post('/alerts', alertData);
    return { data: response.data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export async function fetchAlerts() {
  try {
    const response = await nodeAPI.get('/alerts');
    return { data: response.data ?? [], error: null };
  } catch (err) {
    return { data: [], error: err.message };
  }
}

export async function fetchCompare(symbols = []) {
  try {
    const q = symbols.join(',');
    const response = await nodeAPI.get(`/compare?symbols=${q}`);
    return { data: response.data ?? [], error: null };
  } catch (err) {
    return { data: [], error: err.message };
  }
}

export async function fetchHoldingReport(payload) {
  try {
    const r = await nodeAPI.post('/holding-report', payload,
                                 { timeout: 60000 });
    return { data: r.data, error: null };
  } catch (err) {
    return { data: null,
             error: err.response?.data?.error || err.message };
  }
}
