const express = require('express')
const _ = require('lodash')

const {handlePatientRegistration} = require('../../services/patient/patient_registration')

const {patientRegistrationEnums} = require('../../enums/patient_registration')

const router = express.Router()

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
        }

        response.status(400).send({ errorCode })
    }
})

module.exports = router