const mongoose = require('mongoose')
require('../models/Users')
const Users = mongoose.model('users')
require('../models/Posts')
const Posts = mongoose.model('posts')
async function findUser(email, lean) {
    if(!lean) return await Users.findOne({email: email}) //Procura um único usuário
    if (lean) return await Users.findOne({email: email}).lean()
}
//Crie novas funções conforme a necessidade
module.exports = {
    findUser,
    //exporte as novas funções
}