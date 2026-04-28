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
  create: async ({ nombre, precio, categoria, imagen_url = null }) => {
    const res = await db.query(
      'INSERT INTO productos (nombre, precio, categoria, imagen_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, precio, categoria, imagen_url]
    )
    return res.rows[0]
  },
  update: async (id, { nombre, precio, categoria, activo, imagen_url }) => {
    // Solo actualiza imagen si se provee un nuevo valor
    const res = imagen_url !== undefined
      ? await db.query(
          'UPDATE productos SET nombre=$1, precio=$2, categoria=$3, activo=$4, imagen_url=$5 WHERE id=$6 RETURNING *',
          [nombre, precio, categoria, activo ?? true, imagen_url, id]
        )
      : await db.query(
          'UPDATE productos SET nombre=$1, precio=$2, categoria=$3, activo=$4 WHERE id=$5 RETURNING *',
          [nombre, precio, categoria, activo ?? true, id]
        )
    return res.rows[0]
  },
  delete: async (id) => {
    await db.query('UPDATE productos SET activo = false WHERE id = $1', [id])
  }
}

module.exports = ProductModel