require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

app.use('/api/auth',      require('./routes/authRoutes'))
app.use('/api/productos', require('./routes/productRoutes'))
app.use('/api/ventas',    require('./routes/saleRoutes'))
app.use('/api/cierre',    require('./routes/cierreRoutes'))
app.use('/api/reportes',  require('./routes/reportRoutes'))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ mensaje: 'Error interno', error: err.message })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`))

module.exports = app