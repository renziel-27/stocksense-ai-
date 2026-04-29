const express = require('express');
const { body } = require('express-validator');
const { savePrediction } = require('../controllers/saveController');

const router = express.Router();

router.post(
  '/',
  [
    body('stockSymbol').trim().notEmpty().withMessage('Stock symbol is required'),
    body('predictedPrice').isNumeric().withMessage('Predicted price must be a number'),
  ],
  savePrediction
);

module.exports = router;
