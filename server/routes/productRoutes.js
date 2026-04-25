const router = require('express').Router()
const ctrl = require('../controllers/productController')
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware')

router.get('/', authMiddleware, ctrl.getAll)
router.get('/:id', authMiddleware, ctrl.getById)
router.post('/', authMiddleware, adminMiddleware, ctrl.create)
router.put('/:id', authMiddleware, adminMiddleware, ctrl.update)
router.delete('/:id', authMiddleware, adminMiddleware, ctrl.delete)

module.exports = router