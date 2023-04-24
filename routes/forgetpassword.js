const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
//Config
const emailNode = require('../config/nodemailer')
const {hashPassword} = require('../config/bcrypt')
//Helpers
const {findUser, findCode, findCodeById} = require('../helpers/findSchema')
const {passwordVerification} = require('../helpers/formsValidation')
//Modules
require('../models/Codes')
const Codes = mongoose.model('codes')
require('../models/Users.js')
const Users = mongoose.model('users')
//Forgetpassword (/forgetpassword)
router.get('/', (req, res) => res.render('forgetpassword/forgetpassword'))
router.post('/', async (req, res) => {
    if (!await findUser(req.body.email)) {
        req.flash('error', 'Não existe nenhuma conta com esse e-mail')
        res.redirect('/')
    } else {
        let code = await findCode(req.body.email)
        if (code) {
            res.redirect('/forgetpassword/entercode?id=' + code._id)
        } else {
            let newCode = {
                email: req.body.email,
                code: Math.floor(Math.random() * 9000) + 1000 // Gera um código aleatório entre 1000 e 9999
            }
            if (await emailNode(newCode.email, 'Código de redefinição de senha', `<p>Use esse código de verificação para dar continuidade com a redefinição de senha:</p><div style="text-align: center"><h2 style="letter-spacing: 3px">${newCode.code}</h2></div>`)) {
            new Codes(newCode).save().then(code => {
                res.redirect('/forgetpassword/entercode?id=' + code._id)
            })
            } else {
                req.flash('error', 'Houve um erro ao redefinir a senha')
                res.redirect('./')
            }
        }
    }
})
router.get('/entercode', async (req, res) => res.render('register/registeremail', {id: await findCodeById(req.query.id, true)}))
router.post('/entercode', async (req, res) => {
    const user = await findCodeById(req.query.id)
    if (user) {
        if (user.code == req.body.code) {
            res.redirect('/forgetpassword/newpassword?id=' + req.query.id)
        } else {
            req.flash('error', 'Código incorreto')
            res.redirect('/forgetpassword/entercode?id=' + req.query.id)
        }
    } else {
        req.flash('error', 'Código expirado')
        res.redirect('/forgetpassword')
    }
})
router.get('/newpassword', async (req, res) => res.render('forgetpassword/newpassword', {id: await findCodeById(req.query.id, true)}))
router.post('/newpassword', async (req, res) => {
    const errors = passwordVerification(req.body.password, req.body.password2)
        if (errors.length != 0) {
            errors.map(e => {
                e = " " + e
                req.flash('error', e)
            })
            res.redirect('/user/newpassword')
        } else {
            const code = await findCodeById(req.query.id)
            Users.findOne({email: code.email}).then(async user => {
                user.password = await hashPassword(req.body.password)
                user.save(err => {
                    if (err) {
                        console.log(err)
                        req.flash('error', 'Houve um erro ao alterar a senha')
                        res.redirect('/')
                    } else {
                        req.flash('success', 'Senha alterada com êxito')
                        res.redirect('/login')
                    }
                })
            }).catch((err) => {
                console.log('err')
                req.flash('error', 'Houve um erro ao alterar a senha')
                res.redirect('/')
            })
        }
})
module.exports = router