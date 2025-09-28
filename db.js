const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Nehal123$',
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
