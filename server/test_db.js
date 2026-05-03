require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query("SELECT * FROM usuarios WHERE usuario = 'yerson'").then(res => {
  console.log(res.rows);
  pool.end();
}).catch(err => {
  console.error(err);
  pool.end();
});
