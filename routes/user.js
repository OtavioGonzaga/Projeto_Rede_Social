//Carregando módulos
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const upload = require('../config/multer')
const {hashPassword, comparePasswords} = require('../config/bcrypt.js') //Importa duas  funções do bcrypt
const {isAuthenticated} = require('../helpers/AccessControl') //Importa uma verificação que só dá acesso a algumas rotas caso o usuário esteja autenticado
const passport = require('passport')
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
                                                //NADA DESSA ROTA FOI TESTADO
    router.get('/newpost', isAuthenticated, (req, res) => {
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
                var profileImgPath = req.file.path
            } catch (error) {
                var profileImgPath = 'uploads/default.png'
            }
            let newUser = {
                name: req.body.name.trim(),
                email: req.body.email.trim(),
                password: await hashPassword(req.body.password.trim()),
                profileimg: profileImgPath
            }
            console.log(newUser.profileimg)
            new Users(newUser).save().then(() => {
                console.log('Usuário registrado com sucesso')
                res.redirect('../')
            }).catch((err) => {
                console.error('Erro ao registrar usuário: \n' + err)
                req.flash('error', 'Houve um erro interno ao registrar a conta')
                res.redirect('../')
            })
    })
    //Login
    router.get('/login', (req, res) => {
        res.render('user/login')
    })
    router.post('/login', (req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/user/login',
            failureFlash: true //Ativa as mensagens do connect-flash e exibe o texto passado através de um objeto {message: 'mensagem'} como argumento em um erro em config/auth.js
        })(req, res, next)
    })
//Exportações
module.exports = router