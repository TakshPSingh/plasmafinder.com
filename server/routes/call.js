const express = require('express')
const _ = require('lodash')

const router = express.Router()

const {authenticateCall} = require('../middleware/authenticate_call')

const {handleCallRequestFromDonor} = require('../../services/call/call_from_donor')
const {handleCallRequestFromPatient} = require('../../services/call/call_from_patient')

const {MAX_DURATION_OF_CALL_BY_DONOR} = require('../../constants/calls')
const {MAX_DURATION_OF_CALL_BY_PATIENT} = require('../../constants/calls')

router.get('/donor/:apiKey', authenticateCall, async (request, response) => {
    var body = _.pick(request.query, 'From')

    try {
        var dialerPhoneNumber = '+91' + body.From.substring(1)
        var patientPhoneNumber = await handleCallRequestFromDonor(dialerPhoneNumber)
        response.status(200).send(patientPhoneNumber)
    } catch (error) {
        response.status(400).send()
    }
})

router.get('/patient/:apiKey', authenticateCall, async (request, response) => {
    var body = _.pick(request.query, 'From')

    try {
        var dialerPhoneNumber = '+91' + body.From.substring(1)
        var donorPhoneNumber = await handleCallRequestFromPatient(dialerPhoneNumber)
        response.status(200).send(donorPhoneNumber)
    } catch (error) {
        response.status(400).send()
    }
})

module.exports = router