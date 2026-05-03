const router = require('express').Router()
const ctrl = require('../controllers/reportController')
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware')

router.get('/por-dia', authMiddleware, adminMiddleware, ctrl.salesByDay)
router.get('/por-puesto', authMiddleware, adminMiddleware, ctrl.salesByPuesto)
router.get('/por-trabajador', authMiddleware, adminMiddleware, ctrl.salesByWorker)
router.get('/productos-top', authMiddleware, adminMiddleware, ctrl.topProducts)
router.get('/ingresos-totales', authMiddleware, adminMiddleware, ctrl.totalIncome)
router.get('/robo-hormiga', authMiddleware, adminMiddleware, ctrl.roboHormigaAlerts)

module.exports = router