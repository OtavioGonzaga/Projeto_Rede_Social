module.exports = {
    isAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) return next()
        req.flash('error_msg', 'Você deve fazer login para continuar')
        res.redirect('/')
    }
}