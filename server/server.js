const {app} = require('./app')
const {mongoose} = require('../db/mongoose_connect')

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})