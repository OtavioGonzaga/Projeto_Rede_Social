//Carregando módulos
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const upload = require('../config/multer')
const {hashPassword, comparePasswords} = require('../config/bcrypt.js')
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
    router.post('/newpost', upload.single('file'),  (req, res) => {
        try {
            const newPost = {
                description: req.body.description,
                img: req.file.path,
                Date: new Date()
            }
            new Posts(newPost).save().then(() => {
                console.log('Novo Post registrado')
                res.redirect('../')
            }).catch((err) => {
                console.error('Erro ao registrar o post: \n' + err)
            })
        } catch (error) {
            console.error(error)
            const newPost = {
                description: req.body.description,
                Date: new Date()
            }
            new Posts(newPost).save().then(() => {
                console.log('Novo Post registrado')
                res.redirect('../')
            }).catch((err) => {
                console.error('Erro ao registrar o post: \n' + err)
            })
        }

    })
    //Novo usuário (/register)
    router.get('/register', (req, res) => {
        res.render('user/newuser')
    })
    router.post('/register', upload.single('profileimg'), async (req, res) => {
        try {
            let newUser = {
                name: req.body.name,
                email: req.body.email,
                password: await hashPassword(req.body.password),
                profileimg: req.file.path
            }
            new Users(newUser).save().then(() => {
                console.log('Usuário registrado com sucesso')
                res.redirect('../')
            }).catch((err) => {
                console.error('Erro ao registrar usuário: \n' + err)
                res.redirect('../')
            })
        } catch (error) {
            let newUser = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            }
            new Users(newUser).save().then(() => {
                console.log('Usuário registrado com sucesso')
                res.redirect('../')
            }).catch((err) => {
                console.error('Erro ao registrar usuário: \n' + err)
                res.redirect('../')
            })
        }
    })
    //Login
    router.get('/login', (req, res) => {
        res.render('user/login')
    })
    router.post('/login', (req, res) => {
        const newSession = {
            email: req.body.email,
            password: req.body.password
        }
    })
//Exportações
module.exports = router