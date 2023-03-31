//Carregando módulos
const express = require('express')
const mongoose = require('mongoose')
const fs = require('fs')
const router = express.Router()
//Config
const imgHash = require('../config/imageToBase64') //Importa uma função do arquivo especificado que trasforma uma imagem em string
const upload = require('../config/multer')
const {emailNode} = require('../config/nodemailer')
//Helpers
const {findUser} = require('../helpers/findSchema') //Importa uma função que busca os usuários, passando o email no primeiro argumento, e retorna usando o lean() ou não dependendo se o segundo argumento é true ou false (caso não seja passado será false)
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
    if (!req.file) return res.redirect('/user')
<<<<<<< HEAD
    Users.findOne({email: req.session.passport.user}).then(async user => {
        user.profileImg = await imgHash(req.file.path)
=======
    Users.findOne({email: req.session.passport.user}).then(user => {
        let lastImg = user.profileImg
        user.profileImg = req.file.path
>>>>>>> cc625e6
        user.save(err => {
            if (err) {
                console.log(err)
                req.flash('error', 'Houve um erro ao alterar a foto de perfil')
                res.redirect('/user')
            }
            fs.unlink(req.file.path, err => {
                if (err) {
                    console.log(err)
                    req.flash('error', 'Houve um erro ao alterar a foto de perfil')
                    res.redirect('/user')
<<<<<<< HEAD
                } else {
                    req.flash('success', 'Foto de perfil alterada com êxito')
                    res.redirect('/user')
                }
            })
=======
                }
            }
>>>>>>> cc625e6
        })
    }).catch(err => {
        console.log(err)
        req.flash('error', 'Houve um erro ao alterar a foto de perfil')
        res.redirect('/user')
    })
    fs.unlink(`${lastImg}`, err => {
        if (err) {
            console.log(err)
            req.flash('error', 'Houve um erro ao alterar a foto de perfil')
            res.redirect('/user')
        } else {
            req.flash('success', 'Foto de perfil alterada com êxito')
            res.redirect('/user')
        }
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
        email: req.body.email
    }
    if (editUser.name === user.name && editUser.email === user.email) res.redirect('/user')
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
    if (editUser.email != user.email) {
        let emailCode = Math.floor(Math.random() * 9000) + 1000 // Gera um código aleatório entre 1000 e 9999
        new Codes(editUser).save().then(code => {
            emailNode(newUser.email, 'Código de verificação', `<p>Use esse código de verificação para dar continuidade com a criação da conta:</p><div style="text-align: center"><h2 style="letter-spacing: 3px">${emailCode}</h2></div>`)
            res.redirect(`/user/entercode?id=${code._id}`)
        })
    }
})
//Exportações
module.exports = router