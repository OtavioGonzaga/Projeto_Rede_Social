const multer = require("multer") // ATENÇÃO!!! É NECESSÁRIO QUE O FORMULÁRIO QUE USARÁ O MULTER TENHA A PROPIEDADE enctype="multipart/form-data"
const path = require("path")
const storage = multer.diskStorage({
    destination: (req, file, cb) => { //Define o destino do arquivo recebido
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)) //Define o nome do arquivo com base no tempo em milisegundos e adiciona a extensão que nomeia o arquivo
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) { //Filtra o tipo de arquivo para aceitar apenas imagens
        cb(null, true)
    } else {
        return 'Selecione uma imagem como foto de perfil'
    }
}
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
})
module.exports = upload