const express = require('express')

var app = express()
var {mongoose} = require('../db/mongoose-connect')

app.use(express.json())

module.exports = {app}