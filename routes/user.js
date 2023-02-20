//Carregando módulos
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const upload = require('../config/multer')
const {hashPassword, comparePasswords} = require('../config/bcrypt.js') //Importa duas  funções do bcrypt
const {isAuthenticated} = require('../helpers/AccessControl') //Importa uma verificação que só dá acesso a algumas rotas caso o usuário esteja autenticado
const {newAccountValidation} = require('../helpers/FormsValidation') //COMENTA ISSO AQUI TAMBÉM
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
    router.post('/register', upload.single('profileimg'), async (req, res, next) => {
            try { //Tenta acessar o caminho da imagem upada pelo usuário na pasta uploads, caso não consiga, definirá que o caminho é 'uploads/default'.
                var profileImgPath = req.file.path
            } catch (error) {
                var profileImgPath = '/uploads/profileImages/default.png'
            }
            let newUser = { // Acessa os inputs do html e salva os values em um objeto
                name: req.body.name.trim(),
                email: req.body.email.trim(),
                password: req.body.password.trim(),
                password2: req.body.password2.trim(),
                profileimg: profileImgPath
            }
            let verification = await newAccountValidation(newUser.name, newUser.email, newUser.password, newUser.password2) // Função do arquivo FormsValidation.js da pasta helpers que faz a verificação dos values passados pelo usuário
            if (verification.length === 0) { // Caso a verificação não retorne nenhum erro o processo de registro será continuado
                delete newUser.password2 // Deleta a verificação de senha, pois ela não será selva no banco de dados
                newUser.password = await hashPassword(newUser.password) // Espera o bcrypt gerar o hash da senha (pasta config)
                new Users(newUser).save().then(() => { // Após toda a verificação, as informações do usuário são salvas no banco de dados.
                    passport.authenticate('local', { // Ver comentários da rota /login
                        failureFlash: true,
                        failureRedirect: '/login',
                        successFlash: 'Seja bem-vindo', //NÃO ESTÁ FUNCIONANDO, DEVE SER ESTUDADO
                        successRedirect: '/'
                    })(req, res, next)
                }).catch((err) => { // Previne que a aplicação quebre ao registrar um erro.
                    console.error('Erro ao registrar usuário: \n' + err)
                    req.flash('error', 'Houve um erro interno ao registrar a conta')
                    res.redirect('../')
                })
            } else { // Caso a verificação retorne algum erro irá alertar o usuário usando o flash
                verification.map((e) => {
                    e = ' ' + e
                    req.flash('error', e)
                })
                res.redirect('./register')                
            }
    })
    //Login
    router.get('/login', (req, res) => {
        res.render('user/login')
    })
    router.post('/login', (req, res, next) => {
        passport.authenticate('local', { // Informa o passport que a estratégia de autenticação é a local, em seguida passa um objeto com informações do que fazer após a tentativa de autenticação.
            successRedirect: '/', // Em caso de sucesso redireciona o usuário para a home do site.
            successFlash: 'Bem-vindo de volta', // Recebe uma string e exibe-a em caso de sucesso  //NÃO ESTÁ FUNCIONANDO, DEVE SER ESTUDADO
            failureRedirect: '/user/login', //Em caso de falha redireciona para a página de login e exibe o erro.
            failureFlash: true //Ativa as mensagens do connect-flash e exibe o texto passado através de um objeto {message: 'mensagem'} como argumento em um erro em config/auth.js. Para isso é necessário criar um middleware do connect-flash chamado 'error' (em variável global do node)
        })(req, res, next)
    })
//Exportações
module.exports = router