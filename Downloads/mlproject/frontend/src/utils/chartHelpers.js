export function transformPredictionData(apiResponse) {
  const {
    historical_data = [],
    predictions_overlay = [],
    indicators = {},
    patterns = [],
    support_resistance = {},
  } = apiResponse;

  // Main price chart data
  const priceChartData = historical_data.map((row) => ({
    date: new Date(row.Date || row.date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: '2-digit'
    }),
    close:  parseFloat(row.Close?.toFixed(2) || row.close?.toFixed(2)),
    open:   parseFloat(row.Open?.toFixed(2) || row.open?.toFixed(2)),
    high:   parseFloat(row.High?.toFixed(2) || row.high?.toFixed(2)),
    low:    parseFloat(row.Low?.toFixed(2) || row.low?.toFixed(2)),
    volume: parseInt(row.Volume || row.volume),
  }));

  // Merge predicted overlay onto price chart by date
  const predMap = {};
  (predictions_overlay || []).forEach(p => {
    const d = new Date(p.date).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: '2-digit'
    });
    predMap[d] = parseFloat(p.predicted?.toFixed(2));
  });
  priceChartData.forEach(row => {
    if (predMap[row.date]) row.predicted = predMap[row.date];
  });

  // RSI chart data
  const rsiData = (indicators.rsi_series || []).map((v, i) => ({
    date: priceChartData[i]?.date || i,
    rsi: parseFloat(v?.toFixed(2)),
  }));

  // MACD chart data
  const macdData = (indicators.macd_series || []).map((v, i) => ({
    date: priceChartData[i]?.date || i,
    macd:   parseFloat(v?.toFixed(2)),
    signal: parseFloat((indicators.signal_series?.[i])?.toFixed(2)),
    hist:   parseFloat((indicators.hist_series?.[i])?.toFixed(2)),
  }));

  // Bollinger chart data
  const bollingerData = priceChartData.map((row, i) => ({
    ...row,
    upper:  parseFloat((indicators.bollinger_upper_series?.[i])?.toFixed(2)),
    lower:  parseFloat((indicators.bollinger_lower_series?.[i])?.toFixed(2)),
    middle: parseFloat((indicators.sma20_series?.[i])?.toFixed(2)),
  }));

  return {
    priceChartData,
    rsiData,
    macdData,
    bollingerData,
    patterns,
    support_resistance,
    indicators,
  };
}
