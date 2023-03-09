const mongoose  = require("mongoose")
const Schema = mongoose.Schema
const Codes = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    code: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300
    }
})
mongoose.model('codes', Codes)