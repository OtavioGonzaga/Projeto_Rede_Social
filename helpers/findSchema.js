const mongoose = require('mongoose')
require('../models/Users')
const Users = mongoose.model('users')
require('../models/Posts')
const Posts = mongoose.model('posts')
async function findUser(email) {
    return await Users.findOne({email: email})
}