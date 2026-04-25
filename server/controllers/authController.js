const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const UserModel = require('../models/userModel')

const authController = {
  login: async (req, res) => {
    try {
      const { usuario, password } = req.body
      if (!usuario || !password)
        return res.status(400).json({ mensaje: 'Usuario y contraseña requeridos' })

      const user = await UserModel.findByUsuario(usuario)
      if (!user) return res.status(401).json({ mensaje: 'Credenciales inválidas' })

      const valid = await bcrypt.compare(password, user.contrasena_hash)
      if (!valid) return res.status(401).json({ mensaje: 'Credenciales inválidas' })

      const token = jwt.sign(
        { id: user.id, usuario: user.usuario, puesto: user.puesto, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      )

      res.json({
        token,
        usuario: { id: user.id, nombre: user.nombre, usuario: user.usuario, puesto: user.puesto, rol: user.rol }
      })
    } catch (err) {
      res.status(500).json({ mensaje: 'Error del servidor', error: err.message })
    }
  },

  me: async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.id)
      res.json(user)
    } catch (err) {
      res.status(500).json({ mensaje: 'Error del servidor' })
    }
  }
}

module.exports = authController