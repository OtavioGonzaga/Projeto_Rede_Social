const mongoose = require('mongoose')
const Schema = mongoose.Schema // Acessa o Schema de formatação para um coleção do MongoDB
const Posts = new Schema({ // Cria um novo Schema para armazenar postagens no MongoDB
    description: {
        type: String,
        required: false
    },
    img: {
        type: String,
        required: false
    },
    comments: {
        type: Array,
        required: false
    },
    date: {
        type: Date,
        default: new Date()
    }
})
mongoose.model('posts', Posts) //O primeiro argumento dá um nome para o modelo, o segundo passa o Schema do modelo