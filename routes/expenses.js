const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Expense_Records WHERE user_id = ? ORDER BY year DESC, month DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET expenses error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  console.log('POST /expenses body:', req.body);
  console.log('User from token:', req.user);

  const { category, amount, month, year } = req.body;

  if (!category || !amount || !month || !year) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await db.query(
      'INSERT INTO Expense_Records (user_id, category, amount, month, year) VALUES (?,?,?,?,?)',
      [req.user.id, category, amount, month, year]
    );
    res.json({ message: 'Expense added' });
  } catch (err) {
    console.error('POST expenses error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM Expense_Records WHERE expense_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE expenses error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;