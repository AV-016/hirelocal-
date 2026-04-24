// Worker routes for searching and profile management
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /pincodes (public)
router.get('/pincodes', async (req, res) => {
  try {
    const result = await db.query('SELECT DISTINCT pincode FROM users WHERE role = \'worker\'');
    res.json(result.rows.map(row => row.pincode));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /search?pincode=&skill=
router.get('/search', async (req, res) => {
  const { pincode, skill } = req.query;

  try {
    const query = `
      SELECT wp.id, u.name, u.pincode, wp.skill_category as skill, wp.experience_years as experience, wp.hourly_rate, wp.bio, wp.avg_rating
      FROM worker_profiles wp
      JOIN users u ON wp.user_id = u.id
      WHERE u.pincode = $1 AND LOWER(wp.skill_category) = LOWER($2)
    `;
    const result = await db.query(query, [pincode, skill]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /:id (worker profile ID)
router.get('/:id', async (req, res) => {
  try {
    const query = `
      SELECT wp.id, wp.user_id, wp.skill_category as skill, wp.experience_years as experience, wp.hourly_rate, wp.bio, wp.is_verified as verified, wp.avg_rating, u.name, u.email, u.phone, u.pincode
      FROM worker_profiles wp
      JOIN users u ON wp.user_id = u.id
      WHERE wp.id = $1
    `;
    const result = await db.query(query, [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Worker profile not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /profile (auth required, role=worker)
router.post('/profile', auth, async (req, res) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ error: 'Only workers can create profiles' });
  }

  const { skill_category, experience_years, hourly_rate, bio } = req.body;

  try {
    const existing = await db.query('SELECT * FROM worker_profiles WHERE user_id = $1', [req.user.id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Profile already exists' });
    }

    const result = await db.query(
      'INSERT INTO worker_profiles (user_id, skill_category, experience_years, hourly_rate, bio) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, skill_category, experience_years, hourly_rate, bio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /profile (auth required, role=worker)
router.patch('/profile', auth, async (req, res) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ error: 'Only workers can update profiles' });
  }

  const { hourly_rate, bio, experience_years } = req.body;

  try {
    const result = await db.query(
      'UPDATE worker_profiles SET hourly_rate = COALESCE($1, hourly_rate), bio = COALESCE($2, bio), experience_years = COALESCE($3, experience_years) WHERE user_id = $4 RETURNING *',
      [hourly_rate, bio, experience_years, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
