const Alert = require('../models/Alert');

exports.createAlert = async (req, res, next) => {
  try {
    const { symbol, targetPrice, condition } = req.body;
    
    if (!symbol || !targetPrice || !condition) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const alert = await Alert.create({
      symbol: symbol.toUpperCase(),
      targetPrice: Number(targetPrice),
      condition
    });

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ active: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};
