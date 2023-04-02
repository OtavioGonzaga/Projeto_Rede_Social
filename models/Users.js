const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Users = new Schema({
    name: {
        type: String,
        required: true
    },
    isAdm: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profileImg: {
        type: String,
        default: "1qpzBq_HyWZb_Mfp_5OebVxf8U2qqA67I"
    }
})
mongoose.model('users', Users)