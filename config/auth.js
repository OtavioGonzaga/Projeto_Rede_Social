const mongoose = require('mongoose')
const LocalStrategy = require('passport-local').Strategy
require('../models/Users')
const Users = mongoose.model('users')
const {hashPasswords, comparePasswords} = require('../config/bcrypt')
//Login e sessão
module.exports = passport => { //Exporta toda a função de login
    async function findUser(email) { //Usa o email como indentificador único
        const user = await Users.findOne({email: email})
        return user
    }
    passport.serializeUser((user, done) => {
        done(null, user.email)
    })
    passport.deserializeUser(async (user, done) => {
        try {
            const user1 = await findUser(user)
            done(null, user1)
        } catch (error) {
            console.log(error)
            return done(error, null)
        }
    })
    passport.use(new LocalStrategy({ //Usa usuário e senha para autenticar a sessão
        usernameField: 'email',
        passwordField: 'password'
    }, async (username, password, done) => { 
        let user = await findUser(username)
        if(!user) return done(null, false)
        if (!comparePasswords(password, user.password)) return done(null, false)
        return done(null, user)
    }))
}