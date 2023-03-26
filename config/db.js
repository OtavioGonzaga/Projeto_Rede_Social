
require('dotenv').config()
module.exports = {mongoURI: `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@cluster0.weycfan.mongodb.net/redeapp`}