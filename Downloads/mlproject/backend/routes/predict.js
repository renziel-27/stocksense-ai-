const express = require('express');
const { getPrediction } = require('../controllers/predictController');
const router = express.Router();

router.post('/', getPrediction);

module.exports = router;
