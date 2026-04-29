const router = require('express').Router();
const axios  = require('axios');

router.post('/', async (req, res) => {
  try {
    const r = await axios.post(
      `${process.env.PYTHON_ML_URL}/holding-report`,
      req.body, { timeout: 60000 }
    );
    res.json(r.data);
  } catch (err) {
    res.status(err.response?.status||500)
       .json({ error: err.response?.data?.detail||err.message });
  }
});

module.exports = router;
