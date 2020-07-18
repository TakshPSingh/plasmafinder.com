const express = require('express')
const _ = require('lodash')

const router = express.Router()

const {authenticateCall} = require('../middleware/authenticate_call')

const {handleCallRequestFromDonor} = require('../../services/call/call_from_donor')

const {MAX_DURATION_OF_CALL_BY_DONOR} = require('../../constants/calls')

router.get('/donor/:apiKey', authenticateCall, async (request, response) => {
    var body = _.pick(request.body, 'From')

    try {
        var patientPhoneNumber = await handleCallRequestFromDonor(body.From)
        response.status(200).send({
            destination: {
                numbers: [patientPhoneNumber]
            },
            max_conversation_duration: MAX_DURATION_OF_CALL_BY_DONOR
        })
    } catch (error) {
        response.status(500).send()
    }
})

module.exports = router