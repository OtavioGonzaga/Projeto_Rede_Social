const nodemailer = require('nodemailer');
require('dotenv').config()
const useremail = process.env.USEREMAIL
const userpass = process.env.USERPASS
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    secure: true,
    auth: {
        user: useremail,
        pass: userpass
    },
    tls: {
        rejectUnauthorized: false // Desativar a verificação de certificado
    }
})
async function emailNode(addressee, subject, html) {
    try {
        await transporter.sendMail({
            from: useremail,
            to: addressee,
            replyTo: useremail,
            subject: subject,
            html: html
        })
        return true
    } catch (error) {
        console.log('Erro ao enviar e-mail:\n' + error)
        return false
    }
}
module.exports = emailNode