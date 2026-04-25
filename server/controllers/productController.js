const ProductModel = require('../models/productModel')

const productController = {
  getAll: async (req, res) => {
    try {
      const products = await ProductModel.getAll()
      res.json(products)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },
  getById: async (req, res) => {
    try {
      const p = await ProductModel.getById(req.params.id)
      if (!p) return res.status(404).json({ mensaje: 'No encontrado' })
      res.json(p)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },
  create: async (req, res) => {
    try {
      const { nombre, precio, categoria } = req.body
      if (!nombre || !precio || !categoria)
        return res.status(400).json({ mensaje: 'Nombre, precio y categoría son requeridos' })
      const p = await ProductModel.create({ nombre, precio: parseFloat(precio), categoria })
      res.status(201).json(p)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },
  update: async (req, res) => {
    try {
      const p = await ProductModel.update(req.params.id, req.body)
      if (!p) return res.status(404).json({ mensaje: 'No encontrado' })
      res.json(p)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },
  delete: async (req, res) => {
    try {
      await ProductModel.delete(req.params.id)
      res.json({ mensaje: 'Producto eliminado' })
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  }
}

module.exports = productController