const bcrypt = require('bcryptjs')
//Gerar hash de senha
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10) //Gera um salt para fazer o hash da senha
    const hash = await bcrypt.hash(password, salt) //Gera o hash da senha recebendo a senha e o salt
    return hash
}
//funão de comparar senha e hash
async function comparePasswords(password, hash) {
    const isMatch = await bcrypt.compare(password, hash)
    return isMatch
}
module.exports = { //Exporta as funções do bcrypt para serem chamadas em outros arquivos através de um require: const {nome da função, nome da função 2...} = require(caminho para o arquivo bcrypt.js)
    hashPassword,
    comparePasswords
}