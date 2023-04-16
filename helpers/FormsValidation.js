const mongoose = require("mongoose")
require('../models/Users')
const Users = mongoose.model('users')
function passwordVerification(password, password2) {
    let errors = []
    if (password.length < 6) errors.push('Senha muito pequena')
    if (password.length > 25) errors.push('Senha muito longa')
    if (password.includes(' ')) errors.push('A senha não deve conter espaços')
    if (password != password2) errors.push('Digite a mesma senha nos dois espaços')
    return errors
}
async function newAccountValidation(name, email, password, password2) { // Função de verificação de registro
    let errors = [] // Array que contém as strings que informam os erros que o usuário cometeu au tentar se autenticar
    if (!name || name === undefined || name === null) errors.push('Insira um nome')
    if (name.length < 3) errors.push('Nome muito pequeno')
    if (name.length > 30) errors.push('Nome muito grande')
    if (!email || email === undefined || email === null) errors.push('Insira um e-mail')
    if (email.length < 8 || email.length > 150 || email.includes(' ') || !email.includes('@')) errors.push('Insira um e-mail válido')
    if (await Users.findOne({email: email})) errors.push('Já existe uma conta com esse e-mail') 
    errors = errors.concat(passwordVerification(password, password2))
    return errors // Retorna os erros do cliente
}
// Exportações
module.exports = {
    passwordVerification,
    newAccountValidation
}