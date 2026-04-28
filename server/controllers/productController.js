const ProductModel = require('../models/productModel')
const { cloudinary } = require('../config/cloudinary')

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

  // POST /productos  (multipart/form-data con campo "imagen" opcional)
  create: async (req, res) => {
    try {
      const { nombre, precio, categoria } = req.body
      if (!nombre || !precio || !categoria)
        return res.status(400).json({ mensaje: 'Nombre, precio y categoría son requeridos' })

      const imagen_url = req.file?.path ?? null   // Cloudinary URL

      const p = await ProductModel.create({
        nombre,
        precio: parseFloat(precio),
        categoria,
        imagen_url
      })
      res.status(201).json(p)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },

  // PUT /productos/:id  (multipart/form-data con campo "imagen" opcional)
  update: async (req, res) => {
    try {
      const existing = await ProductModel.getById(req.params.id)
      if (!existing) return res.status(404).json({ mensaje: 'No encontrado' })

      // Si llega imagen nueva, borrar la anterior de Cloudinary
      if (req.file && existing.imagen_url) {
        const parts = existing.imagen_url.split('/')
        const publicId = parts.slice(-3).join('/').replace(/\.[^/.]+$/, '')
        await cloudinary.uploader.destroy(publicId).catch(() => {}) // no-fail
      }

      const imagen_url = req.file?.path  // undefined si no se subió archivo

      const p = await ProductModel.update(req.params.id, {
        nombre:    req.body.nombre    ?? existing.nombre,
        precio:    parseFloat(req.body.precio ?? existing.precio),
        categoria: req.body.categoria ?? existing.categoria,
        activo:    req.body.activo !== undefined ? req.body.activo === 'true' || req.body.activo === true : existing.activo,
        imagen_url
      })
      res.json(p)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },

  // DELETE /productos/:id/imagen  — quita solo la imagen
  deleteImagen: async (req, res) => {
    try {
      const existing = await ProductModel.getById(req.params.id)
      if (!existing) return res.status(404).json({ mensaje: 'No encontrado' })

      if (existing.imagen_url) {
        const parts = existing.imagen_url.split('/')
        const publicId = parts.slice(-3).join('/').replace(/\.[^/.]+$/, '')
        await cloudinary.uploader.destroy(publicId).catch(() => {})
      }

      const p = await ProductModel.update(req.params.id, {
        nombre:    existing.nombre,
        precio:    existing.precio,
        categoria: existing.categoria,
        activo:    existing.activo,
        imagen_url: null
      })
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