// Review routes for submitting and fetching worker reviews
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// POST /submit (role=customer)
router.post('/submit', async (req, res) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: 'Only customers can submit reviews' });
  }

  const { booking_id, rating, comment } = req.body;

  try {
    // Validate booking
    const bookingResult = await db.query(
      "SELECT * FROM bookings WHERE id = $1 AND customer_id = $2 AND status = 'completed'",
      [booking_id, req.user.id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(400).json({ error: 'Valid completed booking not found for this user' });
    }

    const booking = bookingResult.rows[0];

    // Insert review
    const reviewResult = await db.query(
      'INSERT INTO reviews (booking_id, customer_id, worker_id, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [booking_id, req.user.id, booking.worker_id, rating, comment]
    );

    // Update worker average rating
    await db.query(
      `UPDATE worker_profiles 
       SET avg_rating = (SELECT AVG(rating) FROM reviews WHERE worker_id = $1)
       WHERE user_id = $1`,
      [booking.worker_id]
    );

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /worker/:id
router.get('/worker/:id', async (req, res) => {
  try {
    const query = `
      SELECT r.*, u.name as customer_name
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      JOIN worker_profiles wp ON r.worker_id = wp.user_id
      WHERE wp.id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await db.query(query, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
