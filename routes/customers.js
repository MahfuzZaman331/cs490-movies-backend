var express = require('express');
var router = express.Router();
var db = require('../db');

router.get('/', (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const offset = (page - 1) * limit;
  const q = (req.query.q || '').trim();

  let where = '';
  let params = [];
  if (q) {
    if (/^\d+$/.test(q)) {
      where = 'WHERE c.customer_id = ? OR c.first_name LIKE ? OR c.last_name LIKE ?';
      params = [parseInt(q, 10), `%${q}%`, `%${q}%`];
    } else {
      where = 'WHERE c.first_name LIKE ? OR c.last_name LIKE ?';
      params = [`%${q}%`, `%${q}%`];
    }
  }

  const countSql = `SELECT COUNT(*) AS total FROM customer c ${where}`;
  db.query(countSql, params, (err, countRows) => {
    if (err) return res.status(500).send('Database error');
    const total = countRows[0].total;
    const dataSql = `
      SELECT c.customer_id, c.first_name, c.last_name, c.email, c.active, a.address
      FROM customer c
      LEFT JOIN address a ON c.address_id = a.address_id
      ${where}
      ORDER BY c.customer_id
      LIMIT ? OFFSET ?
    `;
    db.query(dataSql, [...params, limit, offset], (err2, rows) => {
      if (err2) return res.status(500).send('Database error');
      res.json({ data: rows, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
    });
  });
});

router.get('/all', (req, res) => {
  const sql = `SELECT customer_id, first_name, last_name FROM customer ORDER BY last_name, first_name`;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).send('Database error');
    res.json(rows);
  });
});

module.exports = router;
