const mongoose = require('mongoose')

mongoose.Promise = global.Promise

mongoose.set('useUnifiedTopology', true)
mongoose.set('useCreateIndex', true)
mongoose.set('useNewUrlParser', true)

mongoose.connect(process.env.MONGODB_URL)

module.exports = {mongoose};