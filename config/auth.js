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
            const user1 = await findUser(user) //Espera a função encontrar o usuário e retorna-o em uma callback 
            done(null, user1)
        } catch (error) {
            console.log(error)
            return done(error, null)
        }
    })
    passport.use(new LocalStrategy({ //Recebe como primeiro argumento um objeto com identificador único e senha, no segundo argumento recebe uma função que espera a validação da senha do usuário autenticado através do bcrypt.js
        usernameField: 'email', //Usa usuário e senha para autenticar a sessão
        passwordField: 'password'
    }, async (username, password, done) => { //Função assíncrona que repassa o identificador único e a senha para a autenticação, ao final invoca a callback para o passport
        let user = await findUser(username)
        if(!user) return done(null, false)
        if (!await comparePasswords(password, user.password)) return done(null, false)
        return done(null, user)
    }))
}