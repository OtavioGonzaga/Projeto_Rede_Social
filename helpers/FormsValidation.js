var errors = []
function newAccountValidation(name, email, password) {
    if (!name) errors.push('Insira um nome')
    if (name.length <= 2) errors.push('Nome muito pequeno')
    if (name.length > 30) errors.push('Nome muito grande')
    if (!email) errors.push('Insira um email')
    
}