const router = require('express').Router()
const ctrl = require('../controllers/userController')
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware')

router.get('/', authMiddleware, adminMiddleware, ctrl.getAll)
router.post('/', authMiddleware, adminMiddleware, ctrl.create)
router.put('/:id', authMiddleware, adminMiddleware, ctrl.update)

module.exports = router
