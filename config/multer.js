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
const fileFilter = function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
        console.log('Tem que ser imagem')
      cb(new Error('Apenas imagens são permitidas!'), false);
    }
  };
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
})
module.exports = upload