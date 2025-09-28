const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/search', (req, res) => {
  const { query } = req.query;
  const sql = `
    SELECT DISTINCT f.film_id, f.title
    FROM film f
    LEFT JOIN film_actor fa ON f.film_id = fa.film_id
    LEFT JOIN actor a ON fa.actor_id = a.actor_id
    LEFT JOIN film_category fc ON f.film_id = fc.film_id
    LEFT JOIN category c ON fc.category_id = c.category_id
    WHERE f.title LIKE ? OR a.first_name LIKE ? OR a.last_name LIKE ? OR c.name LIKE ?
  `;
  const q = `%${query}%`;
  db.query(sql, [q, q, q, q], (err, results) => {
    if (err) return res.status(500).json({ error: 'Query failed' });
    res.json(results);
  });
});


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

// GET /api/films/:id
router.get('/:id', (req, res) => {
  const filmId = req.params.id;

  const query = `
    SELECT 
      film.film_id,
      film.title,
      film.description,
      film.release_year,
      film.length,
      film.rating,
      GROUP_CONCAT(DISTINCT category.name) AS categories,
      GROUP_CONCAT(DISTINCT CONCAT(actor.first_name, ' ', actor.last_name)) AS actors
    FROM film
    LEFT JOIN film_category ON film.film_id = film_category.film_id
    LEFT JOIN category ON film_category.category_id = category.category_id
    LEFT JOIN film_actor ON film.film_id = film_actor.film_id
    LEFT JOIN actor ON film_actor.actor_id = actor.actor_id
    WHERE film.film_id = ?
    GROUP BY film.film_id;
  `;

  db.query(query, [filmId], (err, results) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).send('Database error');
    }

    if (results.length === 0) {
      return res.status(404).send('Film not found');
    }

    res.json(results[0]);
  });
});


module.exports = router;
