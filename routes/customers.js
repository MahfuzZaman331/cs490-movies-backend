const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/all', (req, res) => {
  db.query('SELECT customer_id, first_name, last_name FROM customer ORDER BY first_name LIMIT 100', (err, results) => {
    if (err) return res.status(500).send('Error');
    res.json(results);
  });
});

module.exports = router;
