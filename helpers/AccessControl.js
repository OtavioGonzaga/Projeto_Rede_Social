module.exports = {
    isAuthenticated: (req, res, next) => { //Deve ser passada como segundo argumento em uma rota
        if (req.isAuthenticated()) return next() //A função isAuthenticated() é originada no passport, é usada para verificar se a sessão de usuário está ativa ou não, ou seja, se o usuário estiver logado retornará true e ativará o next(), caso contrário irá redicionar o cliente a página inicial com uma mensagem.
        req.flash('error', 'Você deve fazer login para continuar')
        res.redirect('/')
    }
}