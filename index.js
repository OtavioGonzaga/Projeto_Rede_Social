//Carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const moment = require('moment')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const passport = require('passport')
const session = require('express-session') //Sessão express (sistema de login)
require('./config/auth')(passport) //Faz o requerimento do sistema de autenticação e invoca a a função de login através do argumento passport
const app = express()
require('dotenv').config()
//Configurações
    //Sessão
    app.use(session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {maxAge: 24 * 60 * 60 * 1000}
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    //Connect-flash
    app.use(flash())
    //Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.user = req.user || null
        next()
    })
    //Express
    app.use(express.urlencoded({extended: true})) //É necessário para acessar itens através do método http
    app.use(express.json())
    //Mongoose
    mongoose.set('strictQuery', true)
        //Ao se conectar deve ser usado a string 'mongodb://0.0.0.0:27017' no lugar de 'mongodb://localhost:27017' em alguns dipositivos
    mongoose.connect('mongodb://0.0.0.0:27017/redeapp').then(() => console.log('Conectado ao MongoDB')).catch((err) => console.log('Houve um erro ao se conectar ao MongoDB ' + err))
    //Handlebars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
    //Public
    app.use(express.static('./public'))
//Rotas
    //Home
    app.get('/', (req, res) => {
        res.render('index.handlebars')
    })
    //user(importando '/user')
    const user = require('./routes/user')
    app.use('/user', user)
//Conexão
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Servidor ativo na porta ${port}`))