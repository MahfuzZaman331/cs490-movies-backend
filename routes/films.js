const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/films/top-rented
router.get('/top-rented', (req, res) => {
  const query = `
    SELECT f.film_id, f.title, COUNT(r.rental_id) AS rental_count
    FROM film f
    JOIN inventory i ON f.film_id = i.film_id
    JOIN rental r ON i.inventory_id = r.inventory_id
    GROUP BY f.film_id
    ORDER BY rental_count DESC
    LIMIT 5;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).send('Database error');
    }
    res.json(results);
  });
});

module.exports = router;
