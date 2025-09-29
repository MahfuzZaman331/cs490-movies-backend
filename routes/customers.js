const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/customers?page=1&search=...
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  const searchTerm = `%${search}%`;

  const countQuery = `
    SELECT COUNT(*) AS total
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

  db.query(countQuery, [searchTerm, searchTerm], (err, countResults) => {
    if (err) {
      console.error('Error counting customers:', err);
      return res.status(500).send('Database error');
    }

    const total = countResults[0].total;

    db.query(dataQuery, [searchTerm, searchTerm, limit, offset], (err, dataResults) => {
      if (err) {
        console.error('Error fetching paginated customers:', err);
        return res.status(500).send('Database error');
      }

      res.json({
        customers: dataResults,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    });
  });
});

// GET /api/customers/all — for dropdown
router.get('/all', (req, res) => {
  const q = `
    SELECT customer_id, first_name, last_name
    FROM customer
    ORDER BY first_name, last_name
  `;
  db.query(q, (err, results) => {
    if (err) {
      console.error('Error fetching customers:', err);
      return res.status(500).send('Database error');
    }
    res.json(results);
  });
});

// GET /api/customers/:id — details + rental history
router.get('/:id', (req, res) => {
  const customerId = req.params.id;

  const profileQuery = `
    SELECT customer_id, first_name, last_name, email, active
    FROM customer
    WHERE customer_id = ?
  `;

  const rentalsQuery = `
    SELECT f.title, r.rental_date
    FROM rental r
    JOIN inventory i ON r.inventory_id = i.inventory_id
    JOIN film f ON i.film_id = f.film_id
    WHERE r.customer_id = ?
    ORDER BY r.rental_date DESC
    LIMIT 10
  `;

  db.query(profileQuery, [customerId], (err, profileResults) => {
    if (err) {
      console.error('Error fetching customer profile:', err);
      return res.status(500).send('Database error');
    }

    if (!profileResults.length) {
      return res.status(404).send('Customer not found');
    }

    db.query(rentalsQuery, [customerId], (err, rentalResults) => {
      if (err) {
        console.error('Error fetching customer rentals:', err);
        return res.status(500).send('Database error');
      }

      const customerData = profileResults[0];
      customerData.rentals = rentalResults;
      res.json(customerData);
    });
  });
});

module.exports = router;
