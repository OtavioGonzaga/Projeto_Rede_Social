//Carregando módulos
const express = require('express')
const router = express.Router()
//Config
const imgHash = require('../config/imageToBase64') //Importa uma função do arquivo especificado que trasforma uma imagem em string
//Helpers
const {findUser} = require('../helpers/findSchema') //Importa uma função que busca os usuários, passando o email no primeiro argumento, e retorna usando o lean() ou não dependendo se o segundo argumento é true ou false (caso não seja passado será false)
//Data
var DataAtt = new Date()
setInterval(() => {
DataAtt = new Date()
}, 1000)
//Conta (/)
router.get('/', async (req, res) => {
    const user = await findUser(req.session.passport.user, true)
    user.profileImg = await imgHash(user.profileImg)
    res.render('user/user', {user})
})
//Edit (/edit)
router.get('/edit', async (req, res) => {

                                                                 // Terminar depois

})
//Exportações
module.exports = router