const db = require('../config/db')

const ProductModel = {
  getAll: async () => {
    const res = await db.query(
      'SELECT * FROM productos WHERE activo = true ORDER BY categoria, nombre'
    )
    return res.rows
  },
  getById: async (id) => {
    const res = await db.query('SELECT * FROM productos WHERE id = $1', [id])
    return res.rows[0]
  },
  create: async ({ nombre, precio, categoria, imagen_url = null, stock = 0 }) => {
    const res = await db.query(
      'INSERT INTO productos (nombre, precio, categoria, imagen_url, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, precio, categoria, imagen_url, stock]
    )
    return res.rows[0]
  },
  update: async (id, { nombre, precio, categoria, activo, imagen_url, stock }) => {
    // Solo actualiza imagen si se provee un nuevo valor
    const res = imagen_url !== undefined
      ? await db.query(
          'UPDATE productos SET nombre=$1, precio=$2, categoria=$3, activo=$4, imagen_url=$5, stock=$6 WHERE id=$7 RETURNING *',
          [nombre, precio, categoria, activo ?? true, imagen_url, stock ?? 0, id]
        )
      : await db.query(
          'UPDATE productos SET nombre=$1, precio=$2, categoria=$3, activo=$4, stock=$5 WHERE id=$6 RETURNING *',
          [nombre, precio, categoria, activo ?? true, stock ?? 0, id]
        )
    return res.rows[0]
  },
  delete: async (id) => {
    await db.query('UPDATE productos SET activo = false WHERE id = $1', [id])
  },
  decrementStock: async (id, cantidad) => {
    await db.query('UPDATE productos SET stock = stock - $1 WHERE id = $2 AND stock >= $1', [cantidad, id])
  }
}

module.exports = ProductModel