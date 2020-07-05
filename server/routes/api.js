const express = require('express')

const router = express.Router()

const donor = require('./donor')
const patient = require('./patient')

router.use('/donor', donor)
router.use('/patient', patient)

module.exports = router