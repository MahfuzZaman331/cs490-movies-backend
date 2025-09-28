var express = require('express');
var router = express.Router();
var db = require('../db');

router.post('/rent', (req, res) => {
  const { customer_id, film_id } = req.body;

  const query = `
    INSERT INTO rental (rental_date, inventory_id, customer_id, return_date, staff_id)
    SELECT NOW(), i.inventory_id, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), 1
    FROM inventory i
    WHERE i.film_id = ?
    LIMIT 1
  `;

  db.query(query, [customer_id, film_id], (err, result) => {
    if (err) {
      console.error('Rental error:', err);
      return res.status(500).json({ error: 'Rental failed' });
    }
    res.json({ message: 'Rental successful' });
  });
});

module.exports = router;
