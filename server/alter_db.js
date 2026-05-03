require('dotenv').config({path: 'c:\\panaderia\\.env'});
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query("ALTER TABLE productos ADD COLUMN stock INTEGER DEFAULT 0;").then(res => {
  console.log('Column stock added successfully');
  pool.end();
}).catch(err => {
  console.error(err);
  pool.end();
});
