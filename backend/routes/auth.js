// Authentication routes for signup and login
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

// POST /signup
router.post('/signup', async (req, res) => {
  const { 
    name, email, password, phone, pincode, role, 
    skill_category, skill, 
    experience_years, experience, 
    hourly_rate, bio 
  } = req.body;

  const final_skill = skill_category || skill;
  const final_experience = experience_years !== undefined ? experience_years : experience;

  if (!name || !email || !password || !phone || !pincode || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Start transaction
    await db.query('BEGIN');

    const userResult = await db.query(
      'INSERT INTO users (name, email, password_hash, phone, pincode, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, phone, pincode',
      [name, email, passwordHash, phone, pincode, role]
    );

    const user = userResult.rows[0];

    if (role === 'worker') {
      await db.query(
        'INSERT INTO worker_profiles (user_id, skill_category, experience_years, hourly_rate, bio) VALUES ($1, $2, $3, $4, $5)',
        [user.id, final_skill, final_experience, hourly_rate, bio]
      );
    }

    await db.query('COMMIT');

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /me
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userResult = await db.query('SELECT id, name, email, role, phone, pincode FROM users WHERE id = $1', [decoded.id]);
    const user = userResult.rows[0];
    
    if (user.role === 'worker') {
      const profileResult = await db.query('SELECT * FROM worker_profiles WHERE user_id = $1', [user.id]);
      if (profileResult.rows.length > 0) {
        Object.assign(user, profileResult.rows[0]);
      }
    }
    
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { password_hash, ...userWithoutPassword } = user;
    
    // Include worker details if applicable
    if (userWithoutPassword.role === 'worker') {
      const profileResult = await db.query('SELECT * FROM worker_profiles WHERE user_id = $1', [userWithoutPassword.id]);
      if (profileResult.rows.length > 0) {
        Object.assign(userWithoutPassword, profileResult.rows[0]);
      }
    }
    
    res.json({ token, user: userWithoutPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /update
router.patch('/update', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, phone, bio, hourly_rate } = req.body;

    await db.query('BEGIN');

    // Update users table
    await db.query(
      'UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone) WHERE id = $3',
      [name, phone, decoded.id]
    );

    // Update worker_profiles if applicable
    if (decoded.role === 'worker') {
      await db.query(
        'UPDATE worker_profiles SET bio = COALESCE($1, bio), hourly_rate = COALESCE($2, hourly_rate) WHERE user_id = $3',
        [bio, hourly_rate, decoded.id]
      );
    }

    await db.query('COMMIT');

    // Fetch updated user
    const userResult = await db.query('SELECT id, name, email, role, phone, pincode FROM users WHERE id = $1', [decoded.id]);
    const user = userResult.rows[0];
    if (user.role === 'worker') {
      const profileResult = await db.query('SELECT * FROM worker_profiles WHERE user_id = $1', [user.id]);
      if (profileResult.rows.length > 0) Object.assign(user, profileResult.rows[0]);
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
