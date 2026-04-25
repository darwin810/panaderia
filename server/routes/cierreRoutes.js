const router = require('express').Router()
const ctrl = require('../controllers/cierreController')
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware')

router.get('/resumen', authMiddleware, ctrl.getSummary)
router.post('/', authMiddleware, ctrl.create)
router.get('/', authMiddleware, adminMiddleware, ctrl.getAll)

module.exports = router