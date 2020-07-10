const express = require('express')
const _ = require('lodash')

const {handleDonorRegistration} = require('../../services/donor/donor_registration')
const {verifyDonor} = require('../../services/donor/donor_verification')

const {donorRegistrationEnums} = require('../../enums/donor_registration')
const {donorVerificationEnums} = require('../../enums/donor_verification')

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

router.post('/verify', async (request, response) => {
    var body = _.pick(request.body, ['phone','otp'])

    try {
        await verifyDonor(body.phone, body.otp)
        response.status(200).send()
    } catch (error) {
        let errorCode

        if (error === donorVerificationEnums.DONOR_NOT_FOUND) {
            errorCode = donorVerificationEnums.DONOR_NOT_FOUND
        } else if (error === donorVerificationEnums.INCORRECT_OTP_ANOTHER_ONE_SENT) {
            errorCode = donorVerificationEnums.INCORRECT_OTP_ANOTHER_ONE_SENT
        } else if (error === donorVerificationEnums.INCORRECT_OTP_AND_RAN_OUT_OF_CHANCES) {
            errorCode = donorVerificationEnums.INCORRECT_OTP_AND_RAN_OUT_OF_CHANCES
        } else if (error === donorVerificationEnums.RAN_OUT_OF_CHANCES) {
            errorCode = donorVerificationEnums.RAN_OUT_OF_CHANCES
        } else if (error === donorVerificationEnums.ALREADY_VERIFIED) {
            errorCode = donorVerificationEnums.ALREADY_VERIFIED
        } else {
            errorCode = donorVerificationEnums.UNEXPECTED_ERROR
        }

        response.status(400).send({ errorCode })
    }
})

module.exports = router