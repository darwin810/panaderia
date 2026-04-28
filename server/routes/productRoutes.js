const router = require('express').Router()
const ctrl = require('../controllers/productController')
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware')
const { upload } = require('../config/cloudinary')

// upload.single('imagen') procesa el campo "imagen" del FormData
router.get('/',    authMiddleware,                          ctrl.getAll)
router.get('/:id', authMiddleware,                          ctrl.getById)
router.post('/',   authMiddleware, adminMiddleware, upload.single('imagen'), ctrl.create)
router.put('/:id', authMiddleware, adminMiddleware, upload.single('imagen'), ctrl.update)
router.delete('/:id/imagen', authMiddleware, adminMiddleware, ctrl.deleteImagen)
router.delete('/:id',        authMiddleware, adminMiddleware, ctrl.delete)

module.exports = router