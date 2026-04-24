// Proxy route for location services to avoid CORS and set proper headers
const express = require('express');
const router = express.Router();

// GET /api/location/search?q=...
router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HireLocal-App/1.0 (contact@hirelocal.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Location search error:', err.message);
    res.status(500).json({ error: 'Failed to fetch location data' });
  }
});

// GET /api/location/reverse?lat=...&lon=...
router.get('/reverse', async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HireLocal-App/1.0 (contact@hirelocal.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Reverse geocode error:', err.message);
    res.status(500).json({ error: 'Failed to fetch reverse geocode data' });
  }
});

module.exports = router;
