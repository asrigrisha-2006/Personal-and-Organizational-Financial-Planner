const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/db');

// REGISTER
router.post('/register', async (req, res) => {
  const { full_name, email, phone, password, user_type, org_id } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO Users (full_name, email, phone, user_type, org_id, password, created_at) VALUES (?,?,?,?,?,?,CURDATE())',
      [full_name, email, phone || null, user_type || 'Individual', org_id || null, hashed]
    );
    res.json({ message: 'Account created successfully' });
  } catch (err) {
    console.error('Register error:', err.message);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);

    if (!rows.length) {
      return res.status(400).json({ message: 'No account found with this email' });
    }

    const user = rows[0];

    // handle sample users that have empty password
    if (!user.password) {
      return res.status(400).json({ message: 'Please signup again — account has no password set' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: user.user_id, type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // don't send password back
    delete user.password;

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;