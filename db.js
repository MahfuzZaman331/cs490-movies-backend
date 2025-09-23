const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // your MySQL username
  password: 'Nehal123$', // ← put your password here
  database: 'sakila'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Error connecting to the database:', err);
    return;
  }
  console.log('✅ Connected to the Sakila MySQL database!');
});

module.exports = connection;
