const db = require('../config/db')

const SaleModel = {
  create: async ({ usuario_id, puesto, total, metodo_pago, boleta_impresa, items }) => {
    const client = await db.connect()
    try {
      await client.query('BEGIN')
      const ventaRes = await client.query(
        `INSERT INTO ventas (usuario_id, puesto, total, metodo_pago, boleta_impresa)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [usuario_id, puesto, total, metodo_pago, boleta_impresa]
      )
      const venta = ventaRes.rows[0]
      for (const item of items) {
        await client.query(
          `INSERT INTO venta_items (venta_id,producto_id,nombre_producto,cantidad,precio_unitario,subtotal)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [venta.id, item.producto_id, item.nombre_producto, item.cantidad, item.precio_unitario, item.subtotal]
        )
        await client.query(
          `UPDATE productos SET stock = GREATEST(stock - $1, 0) WHERE id = $2`,
          [item.cantidad, item.producto_id]
        )
      }
      await client.query('COMMIT')
      return venta
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  getAll: async ({ fecha, usuario_id, puesto } = {}) => {
    let query = `
      SELECT v.*, u.nombre as trabajador_nombre,
        json_agg(json_build_object(
          'nombre', vi.nombre_producto,
          'cantidad', vi.cantidad,
          'precio', vi.precio_unitario,
          'subtotal', vi.subtotal
        )) as items
      FROM ventas v
      JOIN usuarios u ON v.usuario_id = u.id
      JOIN venta_items vi ON v.id = vi.venta_id
      WHERE 1=1
    `
    const params = []
    if (fecha) { params.push(fecha); query += ` AND DATE(v.fecha_hora AT TIME ZONE 'UTC' AT TIME ZONE 'America/Santiago') = $${params.length}` }
    if (usuario_id) { params.push(usuario_id); query += ` AND v.usuario_id = $${params.length}` }
    if (puesto) { params.push(puesto); query += ` AND v.puesto = $${params.length}` }
    query += ' GROUP BY v.id, u.nombre ORDER BY v.fecha_hora DESC'
    const res = await db.query(query, params)
    return res.rows
  },

  getById: async (id) => {
    const res = await db.query(
      `SELECT v.*, u.nombre as trabajador_nombre,
        json_agg(json_build_object(
          'nombre', vi.nombre_producto,
          'cantidad', vi.cantidad,
          'precio', vi.precio_unitario,
          'subtotal', vi.subtotal
        )) as items
       FROM ventas v
       JOIN usuarios u ON v.usuario_id = u.id
       JOIN venta_items vi ON v.id = vi.venta_id
       WHERE v.id = $1 GROUP BY v.id, u.nombre`,
      [id]
    )
    return res.rows[0]
  },

  getTodaySalesByUser: async (usuario_id, fecha) => {
    const res = await db.query(
      `SELECT COALESCE(SUM(total),0) as total_dia, COUNT(*) as cantidad_ventas
       FROM ventas WHERE usuario_id=$1 AND DATE(fecha_hora AT TIME ZONE 'UTC' AT TIME ZONE 'America/Santiago')=$2`,
      [usuario_id, fecha]
    )
    return res.rows[0]
  }
}

module.exports = SaleModel