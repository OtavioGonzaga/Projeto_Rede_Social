const fs = require('fs')
const GoogleApis  = require('googleapis')
require('dotenv').config()
const driveFolderID = process.env.FOLDERID
async function uploadFile(fileName, path) {
    try {
        const auth = new GoogleApis.google.auth.GoogleAuth({
            keyFile: 'redeapp-uploads-80dd72a4c84e.json',
            scopes: ['https://www.googleapis.com/auth/drive']
        })
        const driveService = GoogleApis.google.drive({
            version: 'v3',
            auth
        })
        const fileMetaData = {
            'name': fileName,
            'parents': [driveFolderID]
        }
        const media = {
            mimeType: 'image/*',
            body: fs.createReadStream(path)
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
module.exports = uploadFile