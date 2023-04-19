const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
//Config
const emailNode = require('../config/nodemailer')
//Helpers
const {findUser, findCode, findCodeById} = require('../helpers/findSchema')
//Modules
require('../models/Codes')
const Codes = mongoose.model('codes')
//Forgetpassword (/forgetpassword)
router.get('/', (req, res) => res.render('forgetpassword'))
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
router.post('/entercode', (req,res) => {

})
module.exports = router