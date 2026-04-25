const router = require('express').Router()
const ctrl = require('../controllers/saleController')
const { authMiddleware } = require('../middlewares/authMiddleware')

router.post('/', authMiddleware, ctrl.create)
router.get('/', authMiddleware, ctrl.getAll)
router.get('/mis-ventas-hoy', authMiddleware, ctrl.getMySalesToday)
router.get('/:id', authMiddleware, ctrl.getById)

module.exports = router