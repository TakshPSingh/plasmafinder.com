const express = require('express')
const cors = require('cors')

const api = require('./routes/api')

const app = express()

app.use(cors())

app.use('/api', api)

module.exports = {app}