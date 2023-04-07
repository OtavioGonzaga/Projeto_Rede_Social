const fs = require('fs')
const GoogleApis  = require('googleapis')
require('dotenv').config()
const auth = new GoogleApis.google.auth.GoogleAuth({
    keyFile: 'redeapp-uploads-80dd72a4c84e.json',
    scopes: ['https://www.googleapis.com/auth/drive']
})
const driveService = GoogleApis.google.drive({version: 'v3', auth})
async function uploadFile(fileName, path) {
    try {
        const fileMetaData = {
            'name': fileName,
            'parents': [process.env.FOLDERID]
        }
        const media = {
            mimeType: 'image/jpeg',
            body: await fs.createReadStream(path)
        }
        const response = await driveService.files.create({
            resource: fileMetaData,
            media: media,
            fields: 'id'
        })
        return response.data.id
    } catch (error) {
        console.log('Erro de upload no drive: \n' + error)
        return false
    }
}
function deleteFile(fileId) {
    driveService.files.delete({fileId}, err => {
        if (err) console.log('Erro ao excluir arquivo:\n'  + err)
    })
}
module.exports = {
    uploadFile,
    deleteFile
}