const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM Financial_Goals WHERE user_id = ? ORDER BY target_year ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET goals error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  console.log('POST /goals body:', req.body);
  console.log('User from token:', req.user);

  const { goal_type, target_amount, target_year } = req.body;

  if (!goal_type || !target_amount || !target_year) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await db.query(
      'INSERT INTO Financial_Goals (user_id, goal_type, target_amount, target_year) VALUES (?,?,?,?)',
      [req.user.id, goal_type, target_amount, target_year]
    );
    res.json({ message: 'Goal added' });
  } catch (err) {
    console.error('POST goals error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM Financial_Goals WHERE goal_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE goals error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;