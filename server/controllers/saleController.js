const SaleModel = require('../models/saleModel')

const saleController = {
  create: async (req, res) => {
    try {
      const { items, metodo_pago, boleta_impresa } = req.body
      const { id: usuario_id, puesto } = req.user
      if (!items || items.length === 0)
        return res.status(400).json({ mensaje: 'Agrega al menos un producto' })

      const total = items.reduce((sum, i) => sum + i.subtotal, 0)
      const venta = await SaleModel.create({ usuario_id, puesto, total, metodo_pago: metodo_pago || 'efectivo', boleta_impresa: boleta_impresa || false, items })
      res.status(201).json({ mensaje: 'Venta registrada correctamente', venta })
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },
  getAll: async (req, res) => {
    try {
      const { fecha, usuario_id, puesto } = req.query
      const ventas = await SaleModel.getAll({ fecha, usuario_id, puesto })
      res.json(ventas)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },
  getById: async (req, res) => {
    try {
      const v = await SaleModel.getById(req.params.id)
      if (!v) return res.status(404).json({ mensaje: 'Venta no encontrada' })
      res.json(v)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },
  getMySalesToday: async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const result = await SaleModel.getTodaySalesByUser(req.user.id, today)
      res.json(result)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  }
}

module.exports = saleController