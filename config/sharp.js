const sharp = require('sharp')
module.exports = async imgPath => {
    let num = Date.now()
    let output = {
        name: `${num}.jpeg`,
        path: `uploads\\${num}.jpeg`
    }
    const out = await sharp(imgPath).resize(854, 854).toFormat('jpeg').jpeg({ quality: 20 }).toFile(output.path).then(() => {
        return output
    }).catch(err => console.log(err))
    return out
}