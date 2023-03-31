
require('dotenv').config()
module.exports = {
    mongoURI: `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@cluster0.weycfan.mongodb.net/redeapp`,
<<<<<<< HEAD
    mongoLocal: 'mongodb://0.0.0.0:27017/redeapp'
=======
    mongoLocal: "mongodb://0.0.0.0:27017/redeapp"
>>>>>>> cc625e6
}