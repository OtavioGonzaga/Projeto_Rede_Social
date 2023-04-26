const express = require('express')
const router = express.Router()
//Criar Postagem ('/')
router.get('/', (req, res) => res.render('posts/create'))
//exportações
module.exports = router