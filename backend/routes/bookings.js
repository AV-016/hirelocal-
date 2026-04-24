// Booking routes for managing service appointments
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// POST /create (role=customer)
router.post('/create', async (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Only customers can create bookings' });
  }

  const { worker_id, skill_required, description, scheduled_date, total_amount } = req.body;

  try {
    // Resolve the worker's user_id and hourly_rate from the profile_id
    const workerProfile = await db.query('SELECT user_id, hourly_rate FROM worker_profiles WHERE id = $1', [worker_id]);
    if (workerProfile.rows.length === 0) {
      return res.status(404).json({ error: 'Worker profile not found' });
    }
    const { user_id: worker_user_id, hourly_rate } = workerProfile.rows[0];

    // Use provided total_amount or default to worker's hourly rate (representing 1 hour of work)
    const final_amount = total_amount || hourly_rate || 0;

    const result = await db.query(
      'INSERT INTO bookings (customer_id, worker_id, skill_required, description, scheduled_date, total_amount) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, worker_user_id, skill_required, description, scheduled_date, final_amount]
    );

    // Fetch worker's phone for the success page
    const workerInfo = await db.query('SELECT phone, name FROM users WHERE id = $1', [worker_user_id]);

    res.status(201).json({ 
      message: 'Booking created successfully', 
      booking_id: result.rows[0].id,
      worker_phone: workerInfo.rows[0].phone,
      worker_name: workerInfo.rows[0].name
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /my
router.get('/my', async (req, res) => {
  try {
    let query;
    if (req.user.role === 'customer') {
      query = `
        SELECT b.*, u.name as worker_name
        FROM bookings b
        JOIN users u ON b.worker_id = u.id
        WHERE b.customer_id = $1
        ORDER BY b.created_at DESC
      `;
    } else {
      query = `
        SELECT b.*, u.name as customer_name
        FROM bookings b
        JOIN users u ON b.customer_id = u.id
        WHERE b.worker_id = $1
        ORDER BY b.created_at DESC
      `;
    }
    const result = await db.query(query, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /:id/confirm (role=worker)
router.patch('/:id/confirm', async (req, res) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ error: 'Only workers can confirm bookings' });
  }

  try {
    const result = await db.query(
      "UPDATE bookings SET status = 'confirmed' WHERE id = $1 AND worker_id = $2 RETURNING *",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or not assigned to you' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /:id/complete (role=worker)
router.patch('/:id/complete', async (req, res) => {
  if (req.user.role !== 'worker') {
    return res.status(403).json({ error: 'Only workers can complete bookings' });
  }

  try {
    const result = await db.query(
      "UPDATE bookings SET status = 'completed' WHERE id = $1 AND worker_id = $2 RETURNING *",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or not assigned to you' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /:id/cancel
router.patch('/:id/cancel', async (req, res) => {
  try {
    const result = await db.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND (worker_id = $2 OR customer_id = $2) RETURNING *",
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or not authorized' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
