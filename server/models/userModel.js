const db = require('../config/db')

const UserModel = {
  findByUsuario: async (usuario) => {
    const res = await db.query(
      'SELECT * FROM usuarios WHERE usuario = $1 AND activo = true', [usuario]
    )
    return res.rows[0]
  },
  findById: async (id) => {
    const res = await db.query(
      'SELECT id, nombre, usuario, puesto, rol FROM usuarios WHERE id = $1', [id]
    )
    return res.rows[0]
  },
  getAll: async () => {
    const res = await db.query(
      'SELECT id, nombre, usuario, puesto, rol, activo FROM usuarios ORDER BY nombre'
    )
    return res.rows
  },
  create: async ({ nombre, usuario, contrasena_hash, puesto, rol }) => {
    const res = await db.query(
      'INSERT INTO usuarios (nombre, usuario, contrasena_hash, puesto, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, usuario, puesto, rol',
      [nombre, usuario, contrasena_hash, puesto, rol]
    )
    return res.rows[0]
  },
  update: async (id, { nombre, usuario, puesto, rol, activo }) => {
    const res = await db.query(
      'UPDATE usuarios SET nombre=$1, usuario=$2, puesto=$3, rol=$4, activo=$5 WHERE id=$6 RETURNING id, nombre, usuario, puesto, rol, activo',
      [nombre, usuario, puesto, rol, activo, id]
    )
    return res.rows[0]
  },
  updatePassword: async (id, contrasena_hash) => {
    await db.query('UPDATE usuarios SET contrasena_hash=$1 WHERE id=$2', [contrasena_hash, id])
  }
}

module.exports = UserModel