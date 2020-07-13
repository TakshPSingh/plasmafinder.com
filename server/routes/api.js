const express = require('express')

const router = express.Router()

const donor = require('./donor')
const patient = require('./patient')
const call = require('./call')

router.use('/donor', donor)
router.use('/patient', patient)
router.use('/call', call)

module.exports = router