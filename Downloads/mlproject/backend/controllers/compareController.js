const axios = require('axios');
const PYTHON_ML_URL = process.env.PYTHON_ML_URL || 'http://localhost:8000';

exports.getCompare = async (req, res, next) => {
  try {
    const { symbols } = req.query;
    if (!symbols) {
      return res.status(400).json({ success: false, message: 'symbols parameter required (comma separated)' });
    }

    const symbolArray = symbols.split(',').map(s => s.trim().toUpperCase());
    
    const results = await Promise.all(symbolArray.map(async (sym) => {
      try {
        const mlResponse = await axios.post(`${PYTHON_ML_URL}/predict`, {
            symbol: sym,
            period: '1y'
        });
        return { success: true, symbol: sym, data: mlResponse.data };
      } catch (err) {
        return { success: false, symbol: sym, error: err.response?.data?.detail || 'ML failed' };
      }
    }));

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
};
