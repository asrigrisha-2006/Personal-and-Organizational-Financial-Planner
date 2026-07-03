const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Income_Records WHERE user_id = ? ORDER BY year DESC, month DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET income error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  console.log('POST /income body:', req.body);
  console.log('User from token:', req.user);

  const { source, amount, month, year } = req.body;

  if (!source || !amount || !month || !year) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await db.query(
      'INSERT INTO Income_Records (user_id, source, amount, month, year) VALUES (?,?,?,?,?)',
      [req.user.id, source, amount, month, year]
    );
    res.json({ message: 'Income added' });
  } catch (err) {
    console.error('POST income error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;