var {app} = require('./app')
var {mongoose} = require('../db/mongoose-connect')

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})