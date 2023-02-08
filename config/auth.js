//                                              AINDA É NECESSÁRIO COMENTAR O CÓDIGO (PENDENTE)
const mongoose = require('mongoose')
const LocalStrategy = require('passport-local').Strategy
require('../models/Users')
const Users = mongoose.model('users')
const {hashPasswords, comparePasswords} = require('../config/bcrypt')
//Login e sessão
module.exports = passport => {//Exporta toda a função de login
    function findUser(email) { //Usa o email como indentificador único
        Users.find({email: email}).lean().then((user) => {
            return user
        }).catch((err) => {
            console.error('Não foi possível encontrar o usuário \n' + err)
        })
    }
    passport.serializeUser((user, done) => {
        done(null, user.email)
    })
    passport.deserializeUser((user, done) => {
        try {
            const user = findUser(user)
            done(null, user)
        } catch (error) {
            console.log(error)
            return done(err, null)
        }
    })
    passport.use(new LocalStrategy({ //Usa usuário e senha para autenticar a sessão
        usernameField: 'email',
        passwordField: 'password'
    } , (username, password, done) => {
        let user = findUser(username)
        if(!user) return done(null, false)
        if (!comparePasswords(password, username)) return done(null, false)
        console.log(user)
        return done(null, user)
    }))
}