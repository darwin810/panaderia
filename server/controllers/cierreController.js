const CierreModel = require('../models/cierreModel')
const SaleModel = require('../models/saleModel')

const cierreController = {
  getSummary: async (req, res) => {
    try {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })
      const summary = await SaleModel.getTodaySalesByUser(req.user.id, today)
      res.json({ fecha: today, total_sistema: parseFloat(summary.total_dia), cantidad_ventas: parseInt(summary.cantidad_ventas) })
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },
  create: async (req, res) => {
    try {
      const { efectivo_real } = req.body
      const { id: usuario_id, puesto } = req.user
      const fecha = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' })
      if (efectivo_real === undefined) return res.status(400).json({ mensaje: 'El efectivo real es requerido' })

      const existing = await CierreModel.getByFechaAndUser(fecha, usuario_id)
      if (existing) return res.status(400).json({ mensaje: 'Ya realizaste el cierre de caja de hoy' })

      const summary = await SaleModel.getTodaySalesByUser(usuario_id, fecha)
      const cierre = await CierreModel.create({ usuario_id, puesto, fecha, total_sistema: parseFloat(summary.total_dia), efectivo_real: parseFloat(efectivo_real) })
      res.status(201).json({ mensaje: 'Cierre guardado correctamente', cierre })
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },
  getAll: async (req, res) => {
    try {
      const cierres = await CierreModel.getAll()
      res.json(cierres)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  }
}

module.exports = cierreController