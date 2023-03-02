const imageToBase64 = require('image-to-base64')
module.exports = async (imgPath) => {
    try {
        const imgHash = await imageToBase64(imgPath)
        return imgHash
    } catch (error) {
        console.log(error)
        return false
    }
}