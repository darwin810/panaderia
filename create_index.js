const pool = require('./server/config/db')

async function run() {
  try {
    await pool.query('CREATE INDEX IF NOT EXISTS idx_productos_activo_cat_nom ON productos(activo, categoria, nombre);')
    console.log('Index created successfully')
  } catch (err) {
    console.error(err)
  } finally {
    pool.end()
  }
}

run()
