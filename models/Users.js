const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Users = new Schema({
    name: {
        type: String,
        required: true
    },
    isAdm: {
        type: Number,
        default: 0
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profileimg: {
        type: String,
        default: '../uploads/default.png'
    }
})
mongoose.model('users', Users)