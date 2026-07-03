const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Investment_Plans WHERE user_id = ? ORDER BY year DESC, month DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET investments error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  console.log('POST /investments body:', req.body);
  console.log('User from token:', req.user);

  const {
    month, year,
    stocks_percent, mutual_funds_percent,
    fixed_deposit_percent, emergency_fund_percent,
    risk_level
  } = req.body;

  if (!month || !year || !risk_level) {
    return res.status(400).json({ message: 'Month, year and risk level are required' });
  }

  try {
    await db.query(
      `INSERT INTO Investment_Plans 
       (user_id, month, year, stocks_percent, mutual_funds_percent, 
        fixed_deposit_percent, emergency_fund_percent, risk_level)
       VALUES (?,?,?,?,?,?,?,?)`,
      [
        req.user.id, month, year,
        stocks_percent    || 0,
        mutual_funds_percent  || 0,
        fixed_deposit_percent || 0,
        emergency_fund_percent || 0,
        risk_level
      ]
    );
    res.json({ message: 'Investment plan saved' });
  } catch (err) {
    console.error('POST investments error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;