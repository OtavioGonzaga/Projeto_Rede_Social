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
    router.post('/register', upload.single('profileimg') /*Acessa o campo de uploads do html passado na string*/, async (req, res, next) => {
            try { //Tenta acessar o caminho da imagem upada pelo usuário na pasta uploads, caso não consiga, definirá que o caminho é 'uploads/default'.
                var profileImgPath = req.file.path
            } catch (error) {
                var profileImgPath = 'uploads/default.png'
            }
            let newUser = { //Acessa os inputs do html e salva os values em um objeto
                name: req.body.name.trim(),
                email: req.body.email.trim(),
                password: req.body.password,
                password2: req.body.password2
            }
            let verification = await newAccountValidation(newUser.name, newUser.email, newUser.password, newUser.password2) //Função do arquivo FormsValidation.js da pasta helpers que faz a verificação dos values passados pelo usuário
            if (verification.length === 0) {
                let id = await findCode(newUser.email)
                console.log(id)
                if (id) {
                    res.redirect(`./register/entercode?id=${id._id}`)
                } else {
                    delete newUser.password2
                    newUser.password = await hashPassword(newUser.password)
                    let emailCode = Math.floor(Math.random() * 9000) + 1000
                    emailNode(newUser.email, 'Código de verificação', `<p>Use esse código de verificação para dar continuidade com a criação da conta:</p><div style="text-align: center"><h2 style="letter-spacing: 3px">${emailCode}</h2></div>`)
                    newUser.code = emailCode
                    new Codes(newUser).save().then((code) => {
                        console.log(code)
                    }).catch((err) => {
                        console.log('esse erro mesmo')
                        console.log(err)
                        req.flash('error', 'Houve um erro ao fazer o cadastro')
                        res.redirect('../')
                    })
                }
            } else {
                verification.map((e) => { //Adiciona um espaço para após a vírgula para separar os itens do array
                    e = ' ' + e
                    req.flash('error', e)
                })
                res.redirect('./register')  
            }
            // if (verification.length === 0) { //Caso a verificação não retorne nenhum erro o processo de registro será continuado
            //     delete newUser.password2 //Deleta a verificação de senha, pois ela não será selva no banco de dados
            //     newUser.password = await hashPassword(newUser.password) //Espera o bcrypt gerar o hash da senha (pasta config)
            //     new Users(newUser).save().then(() => { //Após toda a verificação, as informações do usuário são salvas no banco de dados.
            //         passport.authenticate('local', { //Ver comentários da rota /login
            //             failureFlash: true,
            //             failureRedirect: '/login',
            //             successRedirect: '/'
            //         })(req, res, next)
            //     }).catch((err) => { //Previne que a aplicação quebre ao registrar um erro.
            //         console.error('Erro ao registrar usuário: \n' + err)
            //         req.flash('error', 'Houve um erro interno ao registrar a conta')
            //         res.redirect('../')
            //     })
            // } else { //Caso a verificação retorne algum erro irá alertar o usuário usando o flash
            //     verification.map((e) => { //Adiciona um espaço para após a vírgula para separar os itens do array
            //         e = ' ' + e
            //         req.flash('error', e)
            //     })
            //     res.redirect('./register')                
            // }
    })
    //Verificação de nova conta por email (/register/entercode)
    router.get('/register/entercode', (req, res) => {
        res.render('user/registeremail')
    })
    router.post('/register/entercode', async (req, res) => {
        let newUser = await findCodeById(req.query.id)
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
    //Edit (/edit)
    router.get('/edit', isAuthenticated, async (req, res) => {

                                                                                    // Terminar depois

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