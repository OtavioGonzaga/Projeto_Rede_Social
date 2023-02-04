//Carregando módulos
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
//Data
var DataAtt = new Date()
setInterval(() => {
    DataAtt = new Date()
}, 1000)
//Acessando bancos de dados
require('../models/Posts')
const Posts = mongoose.model('posts')
require('../models/Users')
const Users = mongoose.model('users')
//Rotas
    //Nova postagem (/newpost)
    router.get('/newpost', (req, res) => {
        res.render('user/newpost')
    })
    router.post('/newpost', (req, res) => {
        const newPost = {
            description: req.body.description,
            img: req.body.file,
            Date: new Date()
        }
        new Posts(newPost).save().then(() => {
            console.log('Novo Post registrado')
            res.redirect('../')
        }).catch((err) => {
            console.log('Erro ao registrar o post' + err)
        });
    })
    //Novo usuário (/register)
    
//Exportações
module.exports = router