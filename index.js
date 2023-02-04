//Carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const moment = require('moment')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const app = express()
//Configurações
    //Sessão
    app.use(session({
        secret: "@Kn5c42p6239avkssocial",
        resave: true,
        saveUninitialized: true,
        cookie: {maxAge: 24 * 60 * 60 * 1000}
    }))
    //Express
    app.use(express.urlencoded({extended: true})) //É necessário para acessar itens através do método http
    app.use(express.json())
    //Mongoose
    mongoose.set('strictQuery', true)
        //Ao se conectar deve ser usado a string 'mongodb://0.0.0.0:27017' no lugar de 'mongodb://localhost:27017' em alguns dipositivos
    mongoose.connect('mongodb://0.0.0.0:27017').then(() => console.log('Conectado ao MongoDB')).catch((err) => console.log('Houve um erro ao se conectar ao MongoDB ' + err))
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
const port = 2023
app.listen(2023, () => console.log(`Servidor ativo na porta ${port}`))