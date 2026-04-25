const db = require('../config/db')

const reportController = {
  salesByDay: async (req, res) => {
    try {
      const { desde, hasta } = req.query
      const res2 = await db.query(
        `SELECT DATE(fecha_hora) as fecha, COUNT(*) as cantidad_ventas, SUM(total) as total_ingresos
         FROM ventas
         WHERE ($1::date IS NULL OR DATE(fecha_hora) >= $1::date)
           AND ($2::date IS NULL OR DATE(fecha_hora) <= $2::date)
         GROUP BY DATE(fecha_hora) ORDER BY fecha DESC`,
        [desde || null, hasta || null]
      )
      res.json(res2.rows)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },
  salesByPuesto: async (req, res) => {
    try {
      const { fecha } = req.query
      const res2 = await db.query(
        `SELECT puesto, COUNT(*) as cantidad_ventas, SUM(total) as total_ingresos
         FROM ventas WHERE ($1::date IS NULL OR DATE(fecha_hora) = $1::date)
         GROUP BY puesto ORDER BY total_ingresos DESC`,
        [fecha || null]
      )
      res.json(res2.rows)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },
  salesByWorker: async (req, res) => {
    try {
      const { fecha } = req.query
      const res2 = await db.query(
        `SELECT u.nombre as trabajador, v.puesto, COUNT(*) as cantidad_ventas, SUM(v.total) as total_ingresos
         FROM ventas v JOIN usuarios u ON v.usuario_id=u.id
         WHERE ($1::date IS NULL OR DATE(v.fecha_hora) = $1::date)
         GROUP BY u.nombre, v.puesto ORDER BY total_ingresos DESC`,
        [fecha || null]
      )
      res.json(res2.rows)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },
  topProducts: async (req, res) => {
    try {
      const { fecha } = req.query
      const res2 = await db.query(
        `SELECT vi.nombre_producto, SUM(vi.cantidad) as total_cantidad, SUM(vi.subtotal) as total_ingresos
         FROM venta_items vi JOIN ventas v ON vi.venta_id=v.id
         WHERE ($1::date IS NULL OR DATE(v.fecha_hora) = $1::date)
         GROUP BY vi.nombre_producto ORDER BY total_cantidad DESC LIMIT 10`,
        [fecha || null]
      )
      res.json(res2.rows)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },
  totalIncome: async (req, res) => {
    try {
      const { desde, hasta } = req.query
      const res2 = await db.query(
        `SELECT COALESCE(SUM(total),0) as total_general, COUNT(*) as total_ventas, COALESCE(AVG(total),0) as promedio_venta
         FROM ventas
         WHERE ($1::date IS NULL OR DATE(fecha_hora) >= $1::date)
           AND ($2::date IS NULL OR DATE(fecha_hora) <= $2::date)`,
        [desde || null, hasta || null]
      )
      res.json(res2.rows[0])
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  }
}

module.exports = reportController