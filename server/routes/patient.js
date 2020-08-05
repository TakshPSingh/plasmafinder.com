const express = require('express')
const _ = require('lodash')

const {handlePatientRegistration} = require('../../services/patient/patient_registration')
const {handleDonorMatching} = require('../../services/donation/match_patient_with_donor')
const {verifyPatient} = require('../../services/patient/patient_verification')

const {patientRegistrationEnums} = require('../../enums/patient_registration')
const {patientVerificationEnums} = require('../../enums/patient_verification')

const router = express.Router()

router.use(express.json())

router.post('/register', async (request, response) => {
    var body = _.pick(request.body, 'patientInfo')

    try {
        await handlePatientRegistration(body.patientInfo)
        response.status(200).send()
    } catch (error) {
        let errorCode

        if (error === patientRegistrationEnums.VALIDATION_ERROR) {
            errorCode = patientRegistrationEnums.VALIDATION_ERROR
        } else if (error === patientRegistrationEnums.ALREADY_REGISTERED_BUT_PENDING_VERIFICATION) {
            errorCode = patientRegistrationEnums.ALREADY_REGISTERED_BUT_PENDING_VERIFICATION
        } else if (error === patientRegistrationEnums.ALREADY_REGISTERED_AND_VERIFIED) {
            errorCode = patientRegistrationEnums.ALREADY_REGISTERED_AND_VERIFIED
        } else {
            errorCode = patientRegistrationEnums.UNEXPECTED_ERROR   
        }

        response.status(400).send({ errorCode })
    }
})

router.post('/verify', async (request, response) => {
    var body = _.pick(request.body, ['phone','otp'])

    try {
        var patient = await verifyPatient(body.phone, body.otp)
        response.status(200).send()
        await handleDonorMatching(patient)
    } catch (error) {
        let errorCode

        if (error === patientVerificationEnums.PATIENT_NOT_FOUND) {
            errorCode = patientVerificationEnums.PATIENT_NOT_FOUND
        } else if (error === patientVerificationEnums.INCORRECT_OTP_ANOTHER_ONE_SENT) {
            errorCode = patientVerificationEnums.INCORRECT_OTP_ANOTHER_ONE_SENT
        } else if (error === patientVerificationEnums.INCORRECT_OTP_AND_RAN_OUT_OF_CHANCES) {
            errorCode = patientVerificationEnums.INCORRECT_OTP_AND_RAN_OUT_OF_CHANCES
        } else if (error === patientVerificationEnums.RAN_OUT_OF_CHANCES) {
            errorCode = patientVerificationEnums.RAN_OUT_OF_CHANCES
        } else if (error === patientVerificationEnums.ALREADY_VERIFIED) {
            errorCode = patientVerificationEnums.ALREADY_VERIFIED
        } else {
            errorCode = patientVerificationEnums.UNEXPECTED_ERROR
        }

        response.status(400).send({ errorCode })
    }
})

module.exports = router