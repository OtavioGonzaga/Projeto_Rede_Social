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
//Banco de dados
require('./models/Codes')
const Codes = mongoose.model('codes')
require('./models/Users')
const Users = mongoose.model('users')
//Config
const emailNode = require('./config/nodemailer')
const db = require('./config/db').mongoLocal
//Helpers
const {findUser, findCode} = require('./helpers/findSchema')
const {isAuthenticated} = require('./helpers/accessControl')
//Sessão
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 7 * 24 * 60 * 60 * 1000}
}))
app.use(passport.initialize())
app.use(passport.session())
//Connect-flash
app.use(flash())
//Middleware
app.use((req, res, next) => {
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null
    next()
})
//Express
app.use(express.urlencoded({extended: true})) //É necessário para acessar itens através do método http
app.use(express.json())
//Mongoose
mongoose.set('strictQuery', true)
    //Ao se conectar deve ser usado a string 'mongodb://0.0.0.0:27017' no lugar de 'mongodb://localhost:27017' em alguns dipositivos
if (db.includes('.net')) { // Conecta-se ao mongodb atlas ou o mongod
    mongoose.connect(db).then(() => console.log('Conectado ao MongoDB remoto')).catch(err => console.log('Houve um erro ao se conectar ao MongoDB:\n' + err))
} else {
    mongoose.connect(db).then(() => console.log('Conectado ao MongoDB local')).catch(err => console.log('Houve um erro ao se conectar ao MongoDB:\n' + err))
}
//Handlebars
app.engine('handlebars', handlebars.engine({defaultLayout: 'main', helpers: { //Default layout define qual será o nome do arquivo central do handlebars na pasta views/layouts. Helpers define quais serão os ajudadores
    FormatDate: date => { // Define o formato que a data será exibida nos arquivos .handlebars ao usar {{#formatDate date}}{{/formatDate}}
        return moment(date).format('DD/MM/YYYY • HH:mm') // Invoca o moment passando a data como argumento, define o formato dessa data recebendo a string como argumento e retorna a data já formatada para o objeto formatDate
    }
}}))
app.set('view engine', 'handlebars')
//Public
app.use(express.static('./public'))
app.use(express.static('./uploads'))
//Home (/)
app.get('/', (req, res) => {
    res.render('index.handlebars')
})
//Login (/login)
app.get('/login', (req, res) => res.render('login'))
app.post('/login', (req, res, next) => {
    passport.authenticate('local', { //Informa o passport que a estratégia de autenticação é a local, em seguida passa um objeto com informações do que fazer após a tentativa de autenticação.
        successRedirect: '/', //Em caso de sucesso redireciona o usuário para a home do site.
        failureRedirect: '/login', //Em caso de falha redireciona para a página de login e exibe o erro.
        failureFlash: true //Ativa as mensagens do connect-flash e exibe o texto passado através de um objeto {message: 'mensagem'} como argumento em um erro em config/auth.js. Para isso é necessário criar um middleware do connect-flash chamado 'error' (em variável global do node)
    })(req, res, next)
})
//Logout
app.get('/logout', (req, res) => {
    req.logout(err => { // Faz a requisição de logout do passport, recebe um erro, caso haja, como callback
        if (err) {
            console.error(err)
            req.flash('error', 'Não foi possível fazer o logout')
            res.redirect('/')    
        } else {
            req.flash('success', 'Logout realizado com êxito')
            res.redirect('/')
        }
    })
})
//forgetpassword (importando '/forgetpassword')
const forgetpassword = require('./routes/forgetpassword')
app.use('/forgetpassword', forgetpassword)
//user(importando '/user')
const user = require('./routes/user')
app.use('/user', isAuthenticated, user)
//Register(importando '/register)
const register = require('./routes/register')
app.use('/register', register)
//Conexão
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Servidor ativo na porta ${port}`))