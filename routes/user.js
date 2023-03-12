//Carregando módulos
const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const upload = require('../config/multer')
const {hashPassword, comparePasswords} = require('../config/bcrypt.js') //Importa duas  funções do bcrypt
const {isAuthenticated} = require('../helpers/AccessControl') //Importa uma verificação que só dá acesso a algumas rotas caso o usuário esteja autenticado
const {newAccountValidation} = require('../helpers/FormsValidation') //Importa uma verificação de formulário para os campos da rota de registro
const {findUser, findCode, findCodeById} = require('../helpers/findSchema') //Importa uma função que busca os usuários, passando o email no primeiro argumento, e retorna usando o lean() ou não dependendo se o segundo argumento é true ou false (caso não seja passado será false)
const imgHash = require('../config/imageToBase64') //Importa uma função do arquivo especificado que trasforma uma imagem em string
const emailNode = require('../config/nodemailer')
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
require('../models/Codes')
const Codes = mongoose.model('codes')
//Rotas
    //Conta (/)
    router.get('/', isAuthenticated, async (req, res) => {
        const user = await findUser(req.session.passport.user, true)
        user.profileImg = await imgHash(user.profileImg)
        res.render('user/user', {user})
    })
    //Novo usuário (/register)
    router.get('/register', (req, res) => {
        res.render('user/newuser')
    })
    router.post('/register', async (req, res) => {
        let newUser = { //Acessa os inputs do html e salva os values em um objeto
            name: req.body.name.trim(),
            email: req.body.email.trim(),
            password: req.body.password,
            password2: req.body.password2
        }
        let verification = await newAccountValidation(newUser.name, newUser.email, newUser.password, newUser.password2) //Função do arquivo FormsValidation.js da pasta helpers que faz a verificação dos values passados pelo usuário
        if (verification.length === 0) {
            let id = await findCode(newUser.email)
            if (id) {
                if (comparePasswords(newUser.password, id.password) && newUser.name === id.name) {
                    console.log('linha 49')
                    res.redirect(`./entercode?id=${id._id}`)
                } else {
                    Codes.findOne({email: id.email}, async (err, user) => {
                        if (err) throw err
                        user.password = await hashPassword(newUser.password)
                        user.name = newUser.name
                        user.save(err => {
                            if (err) throw err
                        })
                    })
                }
            } else {
                newUser.password = await hashPassword(newUser.password)
                let emailCode = Math.floor(Math.random() * 9000) + 1000
                emailNode(newUser.email, 'Código de verificação', `<p>Use esse código de verificação para dar continuidade com a criação da conta:</p><div style="text-align: center"><h2 style="letter-spacing: 3px">${emailCode}</h2></div>`)
                newUser.code = emailCode
                new Codes(newUser).save().then((code) => {
                    res.redirect(`./entercode?id=${code._id}`)
                }).catch((err) => {
                    console.log(err)
                    req.flash('error', 'Houve um erro ao fazer o cadastro')
                    res.redirect('/')
                })
            }
        } else {
            verification.map((e) => { //Adiciona um espaço para após a vírgula para separar os itens do array
                e = ' ' + e
                req.flash('error', e)
            })
            res.redirect('./')
        }
    })
    //Verificação de nova conta por email (/register/entercode)
    router.get('/register/entercode', async (req, res) => {
        let id = await findCodeById(req.query.id, true)
        if (!id) res.redirect('/')
        res.render('user/registeremail', {id})
    })
    router.post('/register/entercode', async (req, res, next) => {
        let newUser = await findCodeById(req.body.id)
        if (!newUser) {
            req.flash('error', 'Tempo limite de servidor')
            res.redirect('./')
        } else {
            if (req.body.code != newUser.code) {
                req.flash('error', 'Código incorreto')
                res.redirect(`./entercode?id=${req.body.id}`)
            } else {
                newUser = {
                    name: newUser.name,
                    email: newUser.email,
                    password: newUser.password
                }
                if (await findUser(newUser.email)) {
                    req.flash('error', 'Já existe uma conta com esse email')
                    res.redirect('/')
                } else {
                    new Users(newUser).save().then(() => {
                        try {
                            passport.authenticate('local', { //Informa o passport que a estratégia de autenticação é a local, em seguida passa um objeto com informações do que fazer após a tentativa de autenticação.
                                successRedirect: './uploadprofileimg', //Em caso de sucesso redireciona o usuário para a home do site.
                                failureRedirect: './', //Em caso de falha redireciona para a página de login e exibe o erro.
                                failureFlash: true //Ativa as mensagens do connect-flash e exibe o texto passado através de um objeto {message: 'mensagem'} como argumento em um erro em config/auth.js. Para isso é necessário criar um middleware do connect-flash chamado 'error' (em variável global do node)
                            })(req, res, next)
                        } catch (error) {
                            console.log(error)
                            req.flash('error', 'Não foi possível fazer login')
                            res.redirect('./uploadprofileimg')
                        }
                    }).catch((err) => {
                        console.log('Erro ao salvar a conta: \n' + err)
                        req.flash('error', 'Tempo limite de servidor')
                        res.redirect('/')
                    })
                }
            }
        }
    })
    //Edit (/edit)
    router.get('/edit', isAuthenticated, async (req, res) => {

                                                                     // Terminar depois

    })
    //Login (/login)
    router.get('/login', (req, res) => {
        res.render('user/login')
    })
    router.post('/login', (req, res, next) => {
        passport.authenticate('local', { //Informa o passport que a estratégia de autenticação é a local, em seguida passa um objeto com informações do que fazer após a tentativa de autenticação.
            successRedirect: '/', //Em caso de sucesso redireciona o usuário para a home do site.
            failureRedirect: '/user/login', //Em caso de falha redireciona para a página de login e exibe o erro.
            failureFlash: true //Ativa as mensagens do connect-flash e exibe o texto passado através de um objeto {message: 'mensagem'} como argumento em um erro em config/auth.js. Para isso é necessário criar um middleware do connect-flash chamado 'error' (em variável global do node)
        })(req, res, next)
    })
    //Logout
    router.get('/logout', (req, res) => {
        req.logout(err => {
            if (err) {
                console.error(err)
                req.flash('error', 'Não foi possível fazer o logout')
                res.redirect('/')    
            } else {
                req.flash('success', 'Logout realizado com êxito')
                res.redirect('/')
            }
        })
    })
//Exportações
module.exports = router