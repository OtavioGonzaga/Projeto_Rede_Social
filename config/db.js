
require('dotenv').config()
module.exports = {
    mongoURI: `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@cluster0.weycfan.mongodb.net/redeapp`,
    mongoLocal: 'mongodb://0.0.0.0:27017/redeapp'
}