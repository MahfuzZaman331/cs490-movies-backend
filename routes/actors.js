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

// GET /api/actors/:id/films
router.get('/:id/films', (req, res) => {
  const actorId = req.params.id;

  const query = `
    SELECT 
      f.film_id,
      f.title,
      COUNT(r.rental_id) AS rental_count
    FROM film f
    JOIN film_actor fa ON f.film_id = fa.film_id
    JOIN inventory i ON f.film_id = i.film_id
    JOIN rental r ON i.inventory_id = r.inventory_id
    WHERE fa.actor_id = ?
    GROUP BY f.film_id
    ORDER BY rental_count DESC
    LIMIT 5
  `;

  db.query(query, [actorId], (err, results) => {
    if (err) {
      console.error('Error fetching films for actor:', err);
      return res.status(500).send('Database error');
    }
    res.json(results);
  });
});


module.exports = router;
