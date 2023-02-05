const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
require('../models/Users')
const Users = mongoose.model('users')
//Gerar hash de senha
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    return hash
}
//funão de comparar senha e hash
async function comparePasswords(password, hash) {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  }
module.exports = {
    hashPassword,
    comparePasswords
}