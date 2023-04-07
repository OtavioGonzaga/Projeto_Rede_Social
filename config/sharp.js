const sharp = require('sharp')
function resizeImg (imgPath) {
    let num = Date.now()
    let output = {
        name: `${num}.jpeg`,
        path: `uploads/${num}.jpeg`
    }
    sharp(imgPath).resize(854, 854).toFormat('jpeg').jpeg({ quality: 20 }).toFile(output.path, (err, info) => {
        if (err) console.log('Erro sharp:\n' + err)
    })
    return output
}
module.exports = resizeImg