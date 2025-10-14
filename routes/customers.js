const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = 10;
  const search = (req.query.search || '').trim();
  const offset = (page - 1) * limit;

  const where =
    search.length
      ? `WHERE c.customer_id = ? OR c.first_name LIKE ? OR c.last_name LIKE ?`
      : ``;

  const args =
    search.length
      ? [Number.isNaN(+search) ? -1 : +search, `%${search}%`, `%${search}%`]
      : [];

  const dataSql = `
    SELECT c.customer_id, c.first_name, c.last_name, c.email, c.active
    FROM customer c
    ${where}
    ORDER BY c.first_name, c.last_name
    LIMIT ? OFFSET ?
  `;
  const countSql = `
    SELECT COUNT(*) AS total
    FROM customer c
    ${where}
  `;

  db.query(countSql, args, (err, countRows) => {
    if (err) return res.status(500).send('Database error');
    const total = countRows[0].total;
    db.query(dataSql, [...args, limit, offset], (err2, rows) => {
      if (err2) return res.status(500).send('Database error');
      res.json({ customers: rows, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
    });
  });
});

router.get('/all', (req, res) => {
  const q = `
    SELECT customer_id, first_name, last_name
    FROM customer
    WHERE active = 1
    ORDER BY first_name, last_name
  `;
  db.query(q, (err, results) => {
    if (err) return res.status(500).send('Database error');
    res.json(results);
  });
});

router.post('/', (req, res) => {
  const { first_name, last_name, email } = req.body;
  if (!first_name || !last_name || !email) return res.status(400).json({ error: 'Missing fields' });

  const sql = `
    INSERT INTO customer (store_id, first_name, last_name, email, address_id, active, create_date, last_update)
    VALUES (1, ?, ?, ?, 1, 1, NOW(), NOW())
  `;
  db.query(sql, [first_name.trim(), last_name.trim(), email.trim()], (err, result) => {
    if (err) return res.status(500).json({ error: 'Create failed' });
    res.json({ customer_id: result.insertId });
  });
});

router.put('/:id', (req, res) => {
  const { first_name, last_name, email, active } = req.body;
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid id' });

  const sql = `
    UPDATE customer
    SET first_name = COALESCE(?, first_name),
        last_name  = COALESCE(?, last_name),
        email      = COALESCE(?, email),
        active     = COALESCE(?, active),
        last_update = NOW()
    WHERE customer_id = ?
  `;
  db.query(sql, [first_name, last_name, email, typeof active === 'number' ? active : null, id], (err) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ ok: true });
  });
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const sql = `UPDATE customer SET active = 0, last_update = NOW() WHERE customer_id = ?`;
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: 'Delete failed' });
    res.json({ ok: true });
  });
});

router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(400).json({ error: 'Invalid id' });

  const detailSql = `
    SELECT customer_id, first_name, last_name, email, active
    FROM customer
    WHERE customer_id = ?
  `;
  const rentalsSql = `
    SELECT r.rental_id, f.title, r.rental_date, r.return_date
    FROM rental r
    JOIN inventory i ON r.inventory_id = i.inventory_id
    JOIN film f ON i.film_id = f.film_id
    WHERE r.customer_id = ?
    ORDER BY r.rental_date DESC
    LIMIT 20
  `;

  db.query(detailSql, [id], (err, rows) => {
    if (err) return res.status(500).send('Database error');
    if (!rows.length) return res.status(404).send('Not found');
    const customer = rows[0];
    db.query(rentalsSql, [id], (err2, rentals) => {
      if (err2) return res.status(500).send('Database error');
      res.json({ customer, rentals });
    });
  });
});

module.exports = router;
