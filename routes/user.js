//Carregando módulos
const express = require('express')
const mongoose = require('mongoose')
const fs = require('fs')
const router = express.Router()
const passport = require('passport')
//Config
const upload = require('../config/multer')
const resizeImg = require('../config/sharp')
const {uploadFile, deleteFile} = require('../config/drive')
const emailNode = require('../config/nodemailer')
//Helpers
const {findUser, findCode, findCodeById} = require('../helpers/findSchema') //Importa uma função que busca os usuários, passando o email no primeiro argumento, e retorna usando o lean() ou não dependendo se o segundo argumento é true ou false (caso não seja passado será false)

//Acessando bancos de dados
require('../models/Users')
const Users = mongoose.model('users')
require('../models/Codes')
const Codes = mongoose.model('codes')
//Data
var DataAtt = new Date()
setInterval(() => {
DataAtt = new Date()
}, 1000)
//Conta (/)
router.get('/', async (req, res) => {
    const user = await findUser(req.session.passport.user, true)
    res.render('user/user', {user})
})
//Foto de perfil (/profileimg)
router.get('/profileimg', async (req, res) => {
    const user = await findUser(req.session.passport.user, true)
    res.render('user/profileimg', {user})
})
router.post('/profileimg', upload.single('profileimg'), (req, res) => {
    if (!req.file) return res.redirect('/user') // caso não seja enviado nenhum arquivo o usuário é redirecionado para /user
    Users.findOne({email: req.session.passport.user}).then(async user => {
        const lastImg = user.profileImg
        const resize = await resizeImg(req.file.path)
        const up = await uploadFile(resize.name, resize.path)
        if (!up) {
            req.flash('error', 'Houve um erro ao alterar a foto de perfil')
            res.redirect('/user')
        } else {
            deleteFile(lastImg)
            user.profileImg = up
            user.save(err => {
                if (err) {
                    console.log(err)
                    req.flash('error', 'Houve um erro ao alterar a foto de perfil')
                    res.redirect('/user')
                } else {
                    fs.unlink(req.file.path, err => {
                        if (err) console.log(err)
                    })
                    fs.unlink(resize.path, err => {
                        if (err) console.log(err)
                    })
                    req.flash('success', 'Foto de perfil alterada com sucesso')
                    res.redirect('/user')
                }
            })
        }
    }).catch(err => {
        console.log(err)
        req.flash('error', 'Houve um erro ao alterar a foto de perfil')
        res.redirect('/user')
    })
})
//Edit (/edit)
router.get('/edit', async (req, res) => {
    const user = await findUser(req.session.passport.user, true)
    res.render('user/edituser', {user})
})
router.post('/edit', async (req, res) => {
    const user = await findUser(req.session.passport.user)
    let editUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.user.password
    }
    if (editUser.name === user.name && editUser.email === user.email) return res.redirect('/user')
    if (editUser.name != user.name && editUser.email === user.email) {
        Users.findOne({email: user.email}).then(user => {
            user.name = editUser.name
            user.save(err => {
                if (err) {
                    console.log(err)
                    req.flash('error', 'Houve um erro ao editar as informações...')
                    res.redirect('/user/edit')
                }
            })
            req.flash('success', 'As informações foram editadas com êxito')
            res.redirect('/user')
        })
    }
    if (editUser.email != user.email && !(await findUser(editUser.email))) {
        const code = await findCode(editUser.email)
        if (code) {
            res.redirect('/user/entercode?id=' + code.id)
        } else {
            editUser.code = Math.floor(Math.random() * 9000) + 1000 // Gera um código aleatório entre 1000 e 9999
            new Codes(editUser).save().then(async code => {
                if (await emailNode(code.email, 'Código de verificação', `<p>Use esse código de verificação para dar continuidade com a criação da conta:</p><div style="text-align: center"><h2 style="letter-spacing: 3px">${code.code}</h2></div>`)) {
                    res.redirect(`/user/entercode?id=${code._id}`)
                } else {
                    req.flash('error', 'Houve um erro ao editar as informações')
                    res.redirect('/user')
                }
            })
        }
    } else {
        req.flash('error', 'Este e-mail já está em uso')
        res.redirect('/user/edit')
    }
})
//Entercode (/entercode)
router.get('/entercode', async (req, res) => {
    const id =  await findCodeById(req.query.id, true)
    res.render('register/registeremail', {id})
})
router.post('/entercode', async (req, res, next) => {
    const code = await findCodeById(req.body.id)
    if (code.code == req.body.code) {
        Users.findOne({email: req.session.passport.user}).then(async user => {
            if (!user) return res.redirect('/')
            user.email = req.body.email
            user.save(err => {
                if (err) {
                    console.log(err)
                    req.flash('error', 'Houve um erro ao editar as informações')
                    return res.redirect('/user')
                }
                passport.authenticate('local', { //Informa o passport que a estratégia de autenticação é a local, em seguida passa um objeto com informações do que fazer após a tentativa de autenticação.
                    successRedirect: '/user', //Em caso de sucesso redireciona o usuário para a home do site.
                    failureRedirect: '/login', //Em caso de falha redireciona para a página de login e exibe o erro.
                    failureFlash: 'Erro ao iniciar a sessão, faça login novamente', //Ativa as mensagens do connect-flash e exibe o texto passado através de um objeto {message: 'mensagem'} como argumento em um erro em config/auth.js. Para isso é necessário criar um middleware do connect-flash chamado 'error' (em variável global do node)
                    successFlash: 'Informções editadas com sucesso'
                })(req, res, next)
            })
        }).catch(err => {
            console.log(err)
            req.flash('error', 'Houve um erro ao editar as informações')
            res.redirect('/user')
        })
    } else {
        req.flash('error', 'Código incorreto')
        res.redirect('/user/edit')
    }
})
//Exportações
module.exports = router