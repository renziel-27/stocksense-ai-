const express = require('express');
const { getCompare } = require('../controllers/compareController');
const router = express.Router();

router.get('/', getCompare);

module.exports = router;
