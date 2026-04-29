const Prediction = require('../models/Prediction');

exports.savePrediction = async (req, res, next) => {
  try {
    const newPrediction = new Prediction(req.body);
    await newPrediction.save();
    res.status(201).json({ message: "Prediction saved successfully", data: newPrediction });
  } catch (error) {
    next(error);
  }
};
