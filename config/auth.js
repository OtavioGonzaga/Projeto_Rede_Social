//                                              AINDA É NECESSÁRIO COMENTAR O CÓDIGO (PENDENTE)
const mongoose = require('mongoose')
const LocalStrategy = require('passport-local').Strategy
require('../models/Users')
const Users = mongoose.model('users')
//Login e sessão
module.exports = function (passport) {
    function findUser(email) {
        return Users.find(item => item.email === email)
    }
    passport.serializeUser((user, done) => {
        done(null, user.email)
    })
    passport.deserializeUser(() => {
        try {
            const user = findUser(email)
            done(null, user)
        } catch (error) {
            console.log(error)
            return done(err, null)
        }
    })
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    } , (username, password, done) => {
        try {
            const user = findUser(username) 
            if(!user) return done(null, false)
            if (!comparePasswords(password, user.password)) return done(null, false)
            return done(null, user)
        } catch (error) {
            console.log(error)
            return done(error, false)
        }
    }))
}