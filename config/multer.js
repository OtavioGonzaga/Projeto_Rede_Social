const multer = require("multer")
const path = require("path")
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        return 'Selecione uma imagem como foto de perfil'
    }
  }
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
})
module.exports = upload