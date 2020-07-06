const express = require('express')
const _ = require('lodash')

const {handleDonorRegistration} = require('../../services/donor/donor_registration')

const {donorRegistrationEnums} = require('../../enums/donor_registration')

const router = express.Router()

router.post('/register', async (request, response) => {
    var body = _.pick(request.body, 'donorInfo')

    try {
        await handleDonorRegistration(body.donorInfo)
        response.status(200).send()
    } catch (error) {
        let errorCode

        if (error === donorRegistrationEnums.ALREADY_REGISTERED_AND_VERIFIED) {
            errorCode = donorRegistrationEnums.ALREADY_REGISTERED_AND_VERIFIED
        } else if (error === donorRegistrationEnums.ALREADY_REGISTERED_BUT_PENDING_VERIFICATION) {
            errorCode = donorRegistrationEnums.ALREADY_REGISTERED_BUT_PENDING_VERIFICATION
        } else if (error === donorRegistrationEnums.VALIDATION_ERROR) {
            errorCode = donorRegistrationEnums.VALIDATION_ERROR
        } else {
            errorCode = donorRegistrationEnums.UNEXPECTED_ERROR
        }

        response.status(400).send({ errorCode })
    }
})

module.exports = router