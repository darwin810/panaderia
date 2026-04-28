const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Almacenamiento optimizado: webp, 400x400, carpeta dedicada
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'panaderia/productos',
    format: 'webp',           // convierte todo a WebP (más ligero)
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'auto', quality: 'auto:good' }
    ],
    public_id: (req, file) => {
      const nombre = file.originalname.split('.')[0].replace(/\s+/g, '_').toLowerCase()
      return `prod_${Date.now()}_${nombre}`
    }
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Solo se permiten imágenes'), false)
  }
})

module.exports = { cloudinary, upload }
