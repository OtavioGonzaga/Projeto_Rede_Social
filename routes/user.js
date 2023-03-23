//Carregando módulos
const express = require('express')
const mongoose = require('mongoose')
const fs = require('fs')
const router = express.Router()
//Config
const imgHash = require('../config/imageToBase64') //Importa uma função do arquivo especificado que trasforma uma imagem em string
const upload = require('../config/multer')
//Helpers
const {findUser} = require('../helpers/findSchema') //Importa uma função que busca os usuários, passando o email no primeiro argumento, e retorna usando o lean() ou não dependendo se o segundo argumento é true ou false (caso não seja passado será false)
//Acessando bancos de dados
require('../models/Users')
const Users = mongoose.model('users')
//Data
var DataAtt = new Date()
setInterval(() => {
DataAtt = new Date()
}, 1000)
//Conta (/)
router.get('/', async (req, res) => {
    const user = await findUser(req.session.passport.user, true)
    user.profileImg = await imgHash(user.profileImg)
    res.render('user/user', {user})
})
//Foto de perfil (/profileimg)
router.get('/profileimg', async (req, res) => {
    const user = await findUser(req.session.passport.user, true)
    user.profileImg = await imgHash(user.profileImg)
    res.render('user/profileimg', {user})
})
router.post('/profileimg', upload.single('profileimg'), (req, res) => {
    if (!req.file) res.redirect('/user')
    Users.findOne({email: req.session.passport.user}).then((user) => {
        let lastImg = user.profileImg
        user.profileImg = req.file.path
        user.save(err => {
            if (err) {
                console.log(err)
                req.flash('error', 'Houve um erro ao alterar a foto de perfil')
                res.redirect('/user')
            } else {
                if (lastImg === 'uploads/default.png') {
                    req.flash('success', 'Foto de perfil alterada com êxito')
                    res.redirect('/user')
                } else {
                    fs.unlink(`./${lastImg}`, err => {
                        if (err) {
                            console.log(err)
                            req.flash('error', 'Houve um erro ao alterar a foto de perfil')
                            res.redirect('/user')
                        } else {
                            req.flash('success', 'Foto de perfil alterada com êxito')
                            res.redirect('/user')
                        }
                    })
                }
                
            }
        })
    }).catch((err) => {
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
        email: req.body.email
    }
    if (editUser.name === user.name && editUser.email === user.email) res.redirect('/user/edit')
    //terminar depois
})
//Exportações
module.exports = router