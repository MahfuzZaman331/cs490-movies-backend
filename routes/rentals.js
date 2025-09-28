const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', (req, res) => {
  const { customer_id, film_id, staff_id = 1 } = req.body;
  if (!customer_id || !film_id) return res.status(400).send('Missing fields');

  const inventoryQuery = `
    SELECT inventory_id FROM inventory
    WHERE film_id = ? AND inventory_id NOT IN (
      SELECT inventory_id FROM rental WHERE return_date IS NULL
    ) LIMIT 1
  `;

  db.query(inventoryQuery, [film_id], (err, inventoryResults) => {
    if (err) return res.status(500).send('Error checking inventory');
    if (inventoryResults.length === 0) return res.status(404).send('No available copies');

    const inventory_id = inventoryResults[0].inventory_id;
    const insertRental = `
      INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id)
      VALUES (NOW(), ?, ?, ?)
    `;

    db.query(insertRental, [inventory_id, customer_id, staff_id], (err2) => {
      if (err2) return res.status(500).send('Error inserting rental');
      res.send({ success: true });
    });
  });
});

module.exports = router;
