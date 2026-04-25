const db = require('../config/db')

const CierreModel = {
  create: async ({ usuario_id, puesto, fecha, total_sistema, efectivo_real }) => {
    const diferencia = efectivo_real - total_sistema
    const estado = Math.abs(diferencia) < 0.01 ? 'correcto' : diferencia > 0 ? 'sobrante' : 'faltante'
    const res = await db.query(
      `INSERT INTO cierre_caja (usuario_id,puesto,fecha,total_sistema,efectivo_real,diferencia,estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [usuario_id, puesto, fecha, total_sistema, efectivo_real, diferencia, estado]
    )
    return res.rows[0]
  },
  getByFechaAndUser: async (fecha, usuario_id) => {
    const res = await db.query(
      'SELECT * FROM cierre_caja WHERE fecha=$1 AND usuario_id=$2', [fecha, usuario_id]
    )
    return res.rows[0]
  },
  getAll: async () => {
    const res = await db.query(
      `SELECT c.*, u.nombre as trabajador_nombre
       FROM cierre_caja c JOIN usuarios u ON c.usuario_id=u.id
       ORDER BY c.fecha DESC, c.created_at DESC`
    )
    return res.rows
  }
}

module.exports = CierreModel