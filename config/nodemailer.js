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
    }
})
async function emailnode(addressee, subject, html) {
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
        console.log(error)
        return false
    }
}
module.exports = emailnode