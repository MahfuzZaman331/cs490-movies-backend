const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/rent', (req, res) => {
  const { customer_id, film_id } = req.body;
  if (!customer_id || !film_id) return res.status(400).json({ error: 'Missing fields' });

  const sql = `
    INSERT INTO rental (rental_date, inventory_id, customer_id, return_date, staff_id, last_update)
    SELECT NOW(), i.inventory_id, ?, NULL, 1, NOW()
    FROM inventory i
    LEFT JOIN rental r ON r.inventory_id = i.inventory_id AND r.return_date IS NULL
    WHERE i.film_id = ? AND r.rental_id IS NULL
    LIMIT 1
  `;
  db.query(sql, [customer_id, film_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Rental failed' });
    if (!result.affectedRows) return res.status(400).json({ error: 'No available copies' });
    res.json({ ok: true });
  });
});

router.post('/return', (req, res) => {
  const { rental_id } = req.body;
  if (!rental_id) return res.status(400).json({ error: 'Missing rental_id' });
  const sql = `UPDATE rental SET return_date = NOW(), last_update = NOW() WHERE rental_id = ? AND return_date IS NULL`;
  db.query(sql, [rental_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Return failed' });
    if (!result.affectedRows) return res.status(404).json({ error: 'Rental not open or not found' });
    res.json({ ok: true });
  });
});

module.exports = router;
