// routes/actors.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/actors/top
router.get('/top', (req, res) => {
  const query = `
    SELECT 
      a.actor_id,
      CONCAT(a.first_name, ' ', a.last_name) AS name,
      COUNT(DISTINCT i.film_id) AS film_count
    FROM actor a
    JOIN film_actor fa ON a.actor_id = fa.actor_id
    JOIN inventory i ON fa.film_id = i.film_id
    GROUP BY a.actor_id
    ORDER BY film_count DESC
    LIMIT 5
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching top actors:', err);
      return res.status(500).send('Database error');
    }
    res.json(results);
  });
});

module.exports = router;
