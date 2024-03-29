//Módulos
const express = require('express')
const router = express.Router() // Função router do express que interliga as rotas divididas em arquivos separados
const mongoose = require('mongoose')
const passport = require('passport')
//Config
const emailNode = require('../config/nodemailer') // Função para envio de e-mail com os parâmetros (e-mail do remetente, assunto do e-mail, html enviado)
const {hashPassword, comparePasswords} = require('../config/bcrypt') // Exporta funções que geram um hash e que comparam hashes do bcrypt
//Helpers
const {newAccountValidation} = require('../helpers/formsValidation')
const {findUser, findCode, findCodeById} = require('../helpers/findSchema')
//Banco de dados
require('../models/Codes')
const Codes = mongoose.model('codes')
require('../models/Users')
const Users = mongoose.model('users')
//Novo usuário (/)
router.get('/', (req, res) => {
    res.render('register/newuser')
})
router.post('/', async (req, res) => {
    let newUser = { //Acessa os inputs do html e salva os values em um objeto
        name: req.body.name.trim(), // trim() tira os espaços no começo e no final da string
        email: req.body.email.trim(),
        password: req.body.password,
        password2: req.body.password2 // Para verificar se o usuário digitou a senha corretamente
    }
    let verification = await newAccountValidation(newUser.name, newUser.email, newUser.password, newUser.password2) //Função do arquivo FormsValidation.js da pasta helpers que faz a verificação dos values passados pelo usuário
    if (verification.length === 0) { //Se não houver erros 
        let id = await findCode(newUser.email) //Verifica se já existe um código de verificação para esse email
        if (id) { // Caso exista o código de verificação para o email informado pelo usuário executa novas verificações
            if (comparePasswords(newUser.password, id.password) && newUser.name === id.name) { // Verifica se a senha informada e o nome informado corresponde ao já salvo no banco de dados
                res.redirect(`/register/entercode?id=${id._id}`) // Se sim, redireciona para a página que verifica o email
            } else { // Se não, procura pela collection do código e edita o nome e senha para os informados no último acesso
                Codes.findOne({email: id.email}, async (err, user) => {
                    if (err) throw err
                    user.password = await hashPassword(newUser.password)
                    user.name = newUser.name
                    user.save(err => {
                        if (err) throw err
                    })
                })
            }
        } else { // Caso ainda não exista um código para aquele email
            newUser.password = await hashPassword(newUser.password) // Gera um hash de senha 
            let emailCode = Math.floor(Math.random() * 9000) + 1000 // Gera um código aleatório entre 1000 e 9999
            emailNode(newUser.email, 'Código de verificação', `<p>Use esse código de verificação para dar continuidade com a criação da conta:</p><div style="text-align: center"><h2 style="letter-spacing: 3px">${emailCode}</h2></div>`)
            newUser.code = emailCode
            new Codes(newUser).save().then((code) => { // Salva as informações do usuário e o código de verificação
                res.redirect(`/register/entercode?id=${code._id}`)
            }).catch(err => {
                console.log(err)
                req.flash('error', 'Houve um erro ao fazer o cadastro')
                res.redirect('/')
            })
        }
    } else {
        verification.map(e => { //Adiciona um espaço para após a vírgula para separar os itens do array
            e = ' ' + e
            req.flash('error', e) // Exibe os erros na mensagem flash
        })
        res.redirect('/register') //Redireciona para a página de registro onde os erros serão exibidos pelo flash
    }
})
//Verificação de nova conta por email (/register/entercode)
router.get('/entercode', async (req, res) => {
    let id = await findCodeById(req.query.id, true) // Espera o rotorno de um objeto com as informações do usuário e um código para verificar o email (.lean() ativado no segundo argumento)
    if (!id) res.redirect('/') // Caso esse usuário não exista ou já tenha expirado redireciona para a home
    res.render('register/registeremail', {id}) // Passa o objeto salvo na let id para o arquivo handlebars renderizado
})
router.post('/entercode', async (req, res, next) => {
    let newUser = await findCodeById(req.body.id) // Recebe o id do formulário postado e procura um usuário e código no banco de dados
    if (!newUser) { // Caso o usuário não exista ou tenha expirado exibe a mensagem de erro na página de registro
        req.flash('error', 'Tempo limite de servidor')
        res.redirect('/register')
    } else { // Aninha as condições para garantir uma sintaxe que assegure o registro da conta com segurança
        if (req.body.code != newUser.code) { // Verifica se o código inserido pelo usuário é o mesmo do e-mail
            req.flash('error', 'Código incorreto')
            res.redirect(`/register/entercode?id=${req.body.id}`)
        } else { // Caso ocorra como esperado, dá início a validação da conta
            newUser = { // Mantém somente as informações necessária no objeto
                name: newUser.name,
                email: newUser.email,
                password: newUser.password
            }
            if (await findUser(newUser.email)) { // Verifica se já existe uma conta com aquele e-mail
                req.flash('error', 'Já existe uma conta com esse email')
                res.redirect('/')
            } else { // Por fim, ao passar por todas as verificações, o usuário é salvo no banco de dados
                new Users(newUser).save().then(() => {
                    passport.authenticate('local', { //Informa o passport que a estratégia de autenticação é a local, em seguida passa um objeto com informações do que fazer após a tentativa de autenticação.
                        successRedirect: '/user/profileimg', //Em caso de sucesso redireciona o usuário para a home do site.
                        failureRedirect: '/login', //Em caso de falha redireciona para a página de login e exibe o erro.
                        failureFlash: true //Ativa as mensagens do connect-flash e exibe o texto passado através de um objeto {message: 'mensagem'} como argumento em um erro em config/auth.js. Para isso é necessário criar um middleware do connect-flash chamado 'error' (em variável global do node)
                    })(req, res, next)
                }).catch(err => {
                    console.log('Erro ao salvar a conta: \n' + err)
                    req.flash('error', 'Tempo limite de servidor')
                    res.redirect('/')
                })
            }
        }
    }
})
//exportações
module.exports = router