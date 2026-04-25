require('dotenv').config()
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function seed() {
  const client = await pool.connect()
  try {
    console.log('🌱 Iniciando seed...')

    const hashAdmin = await bcrypt.hash('yerson', 10)
    await client.query(`
      INSERT INTO usuarios (nombre, usuario, contrasena_hash, puesto, rol)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (usuario) DO NOTHING
    `, ['Yerson', 'yerson', hashAdmin, 'Administración', 'admin'])

    const hashTrabajador = await bcrypt.hash('trabajador123', 10)
    await client.query(`
      INSERT INTO usuarios (nombre, usuario, contrasena_hash, puesto, rol)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (usuario) DO NOTHING
    `, ['María García', 'maria', hashTrabajador, 'Puesto 1', 'trabajador'])

    const productos = [
      ['Pan francés', 0.50, 'Panes'],
      ['Pan de molde', 3.50, 'Panes'],
      ['Pan ciabatta', 1.50, 'Panes'],
      ['Croissant', 2.00, 'Panes'],
      ['Bizcocho de chocolate', 4.50, 'Pasteles'],
      ['Torta de cumpleaños', 35.00, 'Pasteles'],
      ['Cupcake', 3.00, 'Pasteles'],
      ['Empanada de queso', 2.50, 'Salados'],
      ['Empanada de pollo', 3.00, 'Salados'],
      ['Pizza personal', 8.00, 'Salados'],
      ['Café americano', 4.00, 'Bebidas'],
      ['Café con leche', 5.00, 'Bebidas'],
      ['Jugo de naranja', 4.50, 'Bebidas'],
      ['Agua mineral', 2.00, 'Bebidas'],
    ]

    for (const [nombre, precio, categoria] of productos) {
      await client.query(
        `INSERT INTO productos (nombre, precio, categoria) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [nombre, precio, categoria]
      )
    }

    console.log('✅ Seed completado!')
    console.log('👤 Admin: usuario=yerson | contraseña=yerson')
    console.log('👤 Trabajador: usuario=maria | contraseña=trabajador123')
  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    client.release()
    pool.end()
  }
}

seed()