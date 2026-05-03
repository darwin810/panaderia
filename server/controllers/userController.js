const UserModel = require('../models/userModel')
const bcrypt = require('bcryptjs')

const userController = {
  getAll: async (req, res) => {
    try {
      const users = await UserModel.getAll()
      res.json(users)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  },
  create: async (req, res) => {
    try {
      const { nombre, usuario, password, puesto, rol } = req.body
      if (!nombre || !usuario || !password || !puesto) return res.status(400).json({ mensaje: 'Faltan campos' })
      
      const contrasena_hash = await bcrypt.hash(password, 10)
      const user = await UserModel.create({ nombre, usuario, contrasena_hash, puesto, rol: rol || 'trabajador' })
      res.status(201).json(user)
    } catch (err) { res.status(500).json({ mensaje: 'Error al crear usuario. Verifica que el nombre de usuario no exista.' }) }
  },
  update: async (req, res) => {
    try {
      const { id } = req.params
      const { nombre, usuario, puesto, rol, activo, password } = req.body
      
      const existing = await UserModel.findById(id)
      if (!existing) return res.status(404).json({ mensaje: 'Usuario no encontrado' })

      const updated = await UserModel.update(id, { 
        nombre: nombre || existing.nombre, 
        usuario: usuario || existing.usuario, 
        puesto: puesto || existing.puesto, 
        rol: rol || existing.rol, 
        activo: activo !== undefined ? activo : true
      })

      if (password) {
        const contrasena_hash = await bcrypt.hash(password, 10)
        await UserModel.updatePassword(id, contrasena_hash)
      }

      res.json(updated)
    } catch (err) { res.status(500).json({ mensaje: err.message }) }
  }
}

module.exports = userController
