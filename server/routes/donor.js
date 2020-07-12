const express = require('express')
const _ = require('lodash')

const {handleDonorRegistration} = require('../../services/donor/donor_registration')
const {verifyDonor} = require('../../services/donor/donor_verification')
const {handleVerificationCodeGeneration} = require('../../services/donor/verification_codes/verification_code')
const {handleRequestToCompleteDonation} = require('../../services/donation/donation_completion')
const {handleRequestToCancelDonation} = require('../../services/donation/donation_cancellation')

const {donorRegistrationEnums} = require('../../enums/donor_registration')
const {donorVerificationEnums} = require('../../enums/donor_verification')
const {generateVerificationCodeEnums} = require('../../enums/verification_code')
const {donationCompletionEnums} = require('../../enums/donation_completion')
const {donationCancellationEnums} = require('../../enums/donation_cancellation')

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

router.post('/generate-verification-code', async (request, response) => {
    var body = _.pick(request.body, 'phone')

    try {
        await handleVerificationCodeGeneration(body.phone)
        response.status(200).send()
    } catch (error) {
        let errorCode

        if (error === generateVerificationCodeEnums.DONOR_NOT_FOUND) {
            errorCode = generateVerificationCodeEnums.DONOR_NOT_FOUND
        } else if (error === generateVerificationCodeEnums.NO_PENDING_DONATION_REQUEST_FOUND) {
            errorCode = generateVerificationCodeEnums.NO_PENDING_DONATION_REQUEST_FOUND
        } else if (error === generateVerificationCodeEnums.RAN_OUT_OF_CHANCES) {
            errorCode = generateVerificationCodeEnums.RAN_OUT_OF_CHANCES
        } else {
            errorCode = generateVerificationCodeEnums.UNEXPECTED_ERROR
        }

        response.status(400).send({ errorCode })
    }
})

router.post('/complete-donation', async (request, response) => {
    var body = _.pick(request.body, ['phone', 'verificationCode'])

    try {
        await handleRequestToCompleteDonation(body.phone, body.verificationCode)
        response.status(200).send()
    } catch (error) {
        let errorCode

        if (error === donationCompletionEnums.DONOR_NOT_FOUND) {
            errorCode = donationCompletionEnums.DONOR_NOT_FOUND
        } else if (error === donationCompletionEnums.INCORRECT_VERIFICATION_CODE_ANOTHER_ONE_SENT) {
            errorCode = donationCompletionEnums.INCORRECT_VERIFICATION_CODE_ANOTHER_ONE_SENT
        } else if (error === donationCompletionEnums.INCORRECT_VERIFICATION_CODE_AND_RAN_OUT_OF_CHANCES) {
            errorCode = donationCompletionEnums.INCORRECT_VERIFICATION_CODE_AND_RAN_OUT_OF_CHANCES
        } else if (error === donationCompletionEnums.RAN_OUT_OF_CHANCES) {
            errorCode = donationCompletionEnums.RAN_OUT_OF_CHANCES
        } else if (error === donationCompletionEnums.NO_PENDING_DONATION_REQUEST_FOUND) {
            errorCode = donationCompletionEnums.NO_PENDING_DONATION_REQUEST_FOUND
        } else {
            errorCode = donationCompletionEnums.UNEXPECTED_ERROR
        }

        response.status(400).send({ errorCode })
    }
})

router.post('/cancel-donation', async (request, response) => {
    var body = _.pick(request.body, ['phone', 'verificationCode'])

    try {
        await handleRequestToCancelDonation(body.phone, body.verificationCode)
        response.status(200).send()
    } catch (error) {
        let errorCode

        if (error === donationCancellationEnums.DONOR_NOT_FOUND) {
            errorCode = donationCancellationEnums.DONOR_NOT_FOUND
        } else if (error === donationCancellationEnums.INCORRECT_VERIFICATION_CODE_ANOTHER_ONE_SENT) {
            errorCode = donationCancellationEnums.INCORRECT_VERIFICATION_CODE_ANOTHER_ONE_SENT
        } else if (error === donationCancellationEnums.INCORRECT_VERIFICATION_CODE_AND_RAN_OUT_OF_CHANCES) {
            errorCode = donationCancellationEnums.INCORRECT_VERIFICATION_CODE_AND_RAN_OUT_OF_CHANCES
        } else if (error === donationCancellationEnums.RAN_OUT_OF_CHANCES) {
            errorCode = donationCancellationEnums.RAN_OUT_OF_CHANCES
        } else if (error === donationCancellationEnums.NO_PENDING_DONATION_REQUEST_FOUND) {
            errorCode = donationCancellationEnums.NO_PENDING_DONATION_REQUEST_FOUND
        } else {
            errorCode = donationCancellationEnums.UNEXPECTED_ERROR
        }

        response.status(400).send({ errorCode })
    }
})

module.exports = router