const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/customers
router.get('/', (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  const searchQuery = `%${search}%`;

  const countQuery = `
    SELECT COUNT(*) AS count 
    FROM customer 
    WHERE first_name LIKE ? OR last_name LIKE ?
  `;

  const dataQuery = `
    SELECT customer_id, first_name, last_name, email, active 
    FROM customer 
    WHERE first_name LIKE ? OR last_name LIKE ?
    ORDER BY first_name, last_name 
    LIMIT ? OFFSET ?
  `;

  db.query(countQuery, [searchQuery, searchQuery], (err, countResults) => {
    if (err) {
      console.error('Count query error:', err);
      return res.status(500).json({ error: 'Failed to fetch count' });
    }

    const total = countResults[0].count;

    db.query(dataQuery, [searchQuery, searchQuery, parseInt(limit), parseInt(offset)], (err, dataResults) => {
      if (err) {
        console.error('Data query error:', err);
        return res.status(500).json({ error: 'Failed to fetch customers' });
      }

      res.json({ results: dataResults, total });
    });
  });
});

// GET /api/customers/:id
router.get('/:id', (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT customer_id, first_name, last_name, email, active 
    FROM customer 
    WHERE customer_id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching customer by ID:', err);
      return res.status(500).json({ error: 'Failed to fetch customer' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(results[0]);
  });
});

module.exports = router;
