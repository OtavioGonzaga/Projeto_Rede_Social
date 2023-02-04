const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Posts = new Schema({
    description: {
        type: String,
        required: false
    },
    img: {
        type: String,
        required: false
    },
    Date: {
        type: Date,
        default: new Date()
    }
})
mongoose.model('posts', Posts)