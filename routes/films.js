var express = require('express');
var router = express.Router();
var db = require('../db');

router.get('/top-rented', (req, res) => {
  const q = `
    SELECT f.film_id, f.title, COUNT(r.rental_id) AS rental_count
    FROM film f
    JOIN inventory i ON f.film_id = i.film_id
    JOIN rental r ON i.inventory_id = r.inventory_id
    GROUP BY f.film_id
    ORDER BY rental_count DESC
    LIMIT 5
  `;
  db.query(q, (err, rows) => {
    if (err) return res.status(500).send('Database error');
    res.json(rows);
  });
});

router.get('/search', (req, res) => {
  const term = req.query.query || '';
  const q = `SELECT film_id, title FROM film WHERE title LIKE ? ORDER BY title ASC`;
  db.query(q, [`%${term}%`], (err, rows) => {
    if (err) return res.status(500).send('Database error');
    res.json(rows);
  });
});

router.get('/all', (req, res) => {
  const q = `SELECT film_id, title FROM film ORDER BY title ASC`;
  db.query(q, (err, rows) => {
    if (err) return res.status(500).send('Database error');
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  const q = `
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
    GROUP BY film.film_id
  `;
  db.query(q, [req.params.id], (err, rows) => {
    if (err) return res.status(500).send('Database error');
    if (!rows.length) return res.status(404).send('Film not found');
    res.json(rows[0]);
  });
});

module.exports = router;
