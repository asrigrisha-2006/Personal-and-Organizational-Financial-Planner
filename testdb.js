const mysql = require('mysql2');
require('dotenv').config();

const conn = mysql.createConnection({
  host: '127.0.0.1',      // use IP instead of 'localhost'
  port: 3306,             // change if your MySQL uses different port
  user: 'finplan',
  password: 'finplan123',
  database: 'project_finance'
});

conn.connect(err => {
  if (err) {
    console.error('Connection failed:', err.message);
    console.error('Error code:', err.code);
  } else {
    console.log('Connected successfully!');
  }
  conn.end();
});