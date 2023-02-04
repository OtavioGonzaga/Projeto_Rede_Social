//Carregando módulos
const express = require('express')
const router = express.Router()
//Rotas
    //Nova postagem (/newpost)
    router.get('/newpost', (req, res) => {
        res.render('user/newpost')
    })
//Exportações
module.exports = router