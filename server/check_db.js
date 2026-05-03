require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function check() {
  const { rows: prods } = await pool.query('SELECT id, nombre, stock FROM productos');
  console.log('Productos:', prods);
  const { rows: ventas } = await pool.query('SELECT * FROM ventas ORDER BY id DESC LIMIT 2');
  console.log('Ventas recientes:', ventas);
  const { rows: items } = await pool.query('SELECT * FROM venta_items ORDER BY id DESC LIMIT 5');
  console.log('Items recientes:', items);
  pool.end();
}
check();
