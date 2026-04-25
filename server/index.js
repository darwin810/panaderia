require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')

const app = express()

// Seguridad: Headers HTTP
app.use(helmet())

// Seguridad: Limitar peticiones (Prevención de fuerza bruta/DDoS)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP cada 15 minutos
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.'
})
app.use('/api/', limiter)

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true
}))

// Body parser
app.use(express.json({ limit: '10kb' })) // Límite de payload para evitar ataques de sobrecarga

// Seguridad: Prevenir contaminación de parámetros HTTP
app.use(hpp())

app.use('/api/auth',      require('./routes/authRoutes'))
app.use('/api/productos', require('./routes/productRoutes'))
app.use('/api/ventas',    require('./routes/saleRoutes'))
app.use('/api/cierre',    require('./routes/cierreRoutes'))
app.use('/api/reportes',  require('./routes/reportRoutes'))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ mensaje: 'Error interno del servidor', error: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un problema de seguridad o servidor.' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`🚀 Servidor protegido y ejecutándose en puerto ${PORT}`))

module.exports = app