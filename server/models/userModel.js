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
  }
}

module.exports = UserModel