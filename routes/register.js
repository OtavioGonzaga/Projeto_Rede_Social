//Módulos
const express = require('express')
const router = express.Router() // Função router do express que interliga as rotas divididas em arquivos separados
const mongoose = require('mongoose')
const passport = require('passport')
//Config
const emailNode = require('../config/nodemailer')
const {hashPassword, comparePasswords} = require('../config/bcrypt')
//Helpers
const {newAccountValidation} = require('../helpers/formsValidation')
const {findUser, findCode, findCodeById} = require('../helpers/findSchema')
//Banco de dados
require('../models/Codes')
const Codes = mongoose.model('codes')
require('../models/Users')
const Users = mongoose.model('users')
//Novo usuário (/)
router.get('/', (req, res) => {
    res.render('register/newuser')
})
router.post('/', async (req, res) => {
    let newUser = { //Acessa os inputs do html e salva os values em um objeto
        name: req.body.name.trim(), // trim() tira os espaços no começo e no final da string
        email: req.body.email.trim(),
        password: req.body.password,
        password2: req.body.password2 // Para verificar se o usuário digitou a senha corretamente
    }
    let verification = await newAccountValidation(newUser.name, newUser.email, newUser.password, newUser.password2) //Função do arquivo FormsValidation.js da pasta helpers que faz a verificação dos values passados pelo usuário
    if (verification.length === 0) { //Se não houver erros 
        let id = await findCode(newUser.email) //Verifica se já existe um código de verificação para esse email
        if (id) { // Caso exista o código de verificação para o email informado pelo usuário executa novas verificações
            if (comparePasswords(newUser.password, id.password) && newUser.name === id.name) { // Verifica se a senha informada e o nome informado corresponde ao já salvo no banco de dados
                res.redirect(`/register/entercode?id=${id._id}`) // Se sim, redireciona para a página que verifica o email
            } else { // Se não, procura pela collection do código e edita o nome e senha para os informados no último acesso
                Codes.findOne({email: id.email}, async (err, user) => {
                    if (err) throw err
                    user.password = await hashPassword(newUser.password)
                    user.name = newUser.name
                    user.save(err => {
                        if (err) throw err
                    })
                })
            }
        } else { // Caso ainda não exista um código para aquele email
            newUser.password = await hashPassword(newUser.password) // Gera um hash de senha 
            let emailCode = Math.floor(Math.random() * 9000) + 1000 // Gera um código aleatório entre 1000 e 9999
            emailNode(newUser.email, 'Código de verificação', `<p>Use esse código de verificação para dar continuidade com a criação da conta:</p><div style="text-align: center"><h2 style="letter-spacing: 3px">${emailCode}</h2></div>`)
            newUser.code = emailCode
            new Codes(newUser).save().then((code) => { // Salva as informações do usuário e o código de verificação
                res.redirect(`/register/entercode?id=${code._id}`)
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
router.get('/entercode', async (req, res) => {
    let id = await findCodeById(req.query.id, true)
    if (!id) res.redirect('/')
    res.render('register/registeremail', {id})
})
router.post('/entercode', async (req, res, next) => {
    let newUser = await findCodeById(req.body.id)
    if (!newUser) {
        req.flash('error', 'Tempo limite de servidor')
        res.redirect('./')
    } else {
        if (req.body.code != newUser.code) {
            req.flash('error', 'Código incorreto')
            res.redirect(`/register/entercode?id=${req.body.id}`)
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
                            successRedirect: '/user/uploadprofileimg', //Em caso de sucesso redireciona o usuário para a home do site.
                            failureRedirect: '/login', //Em caso de falha redireciona para a página de login e exibe o erro.
                            failureFlash: true //Ativa as mensagens do connect-flash e exibe o texto passado através de um objeto {message: 'mensagem'} como argumento em um erro em config/auth.js. Para isso é necessário criar um middleware do connect-flash chamado 'error' (em variável global do node)
                        })(req, res, next)
                    } catch (error) {
                        console.log(error)
                        req.flash('error', 'Não foi possível fazer login')
                        res.redirect('/user/uploadprofileimg')
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
//exportações
module.exports = router