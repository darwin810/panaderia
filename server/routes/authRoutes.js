const router = require('express').Router()
const ctrl = require('../controllers/authController')
const { authMiddleware } = require('../middlewares/authMiddleware')

const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per `window` (here, per 15 minutes)
  message: { mensaje: 'Demasiados intentos de inicio de sesión, por favor intente de nuevo en 15 minutos.' }
})

router.post('/login', loginLimiter, ctrl.login)
router.get('/me', authMiddleware, ctrl.me)

module.exports = router