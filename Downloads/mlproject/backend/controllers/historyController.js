const Prediction = require('../models/Prediction');

exports.getHistory = async (req, res, next) => {
  try {
    const { symbol, limit = 20 } = req.query;
    
    let query = {};
    if (symbol) query.stockSymbol = symbol.toUpperCase();

    const history = await Prediction.find(query)
      .sort({ timestamp: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
