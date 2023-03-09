const mongoose = require('mongoose')
require('../models/Users')
const Users = mongoose.model('users')
require('../models/Posts')
const Posts = mongoose.model('posts')
require('../models/Codes')
const Codes = mongoose.model('codes')
async function findUser(email, lean) {
    if(!lean) return await Users.findOne({email: email}) //Procura um único usuário
    if (lean) return await Users.findOne({email: email}).lean()
}
async function findCode(email, lean) {
    if (!lean) return await Codes.findOne({email: email}) //Procura um único usuário
    if (lean) return await Codes.findOne({email: email}).lean()
}
async function findCodeById(id, lean) {
    if (!lean) return await Codes.findById({_id: id})
    if (lean) return await Codes.findById({_id: id}).lean()
}
//Crie novas funções conforme a necessidade
module.exports = {
    findUser,
    findCode,
    findCodeById
    //exporte as novas funções
}