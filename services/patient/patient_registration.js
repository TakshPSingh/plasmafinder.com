const {Patient} = require('../../models/patient')

const {generateAndSendOTP} = require('../common/generate_and_send_otp')

const {patientRegistrationEnums} = require('../../enums/patient_registration')

const registerPatient = async (patientInfo) => {
    var patient = new Patient(patientInfo)
    
    patient.numberOfTimesOTPSent = 0
    patient.verified = false
    patient.callsLeft = 0

    delete patient.donorId

    var patientValidationError = patient.validateSync()
    if (patientValidationError) {
        throw patientRegistrationEnums.VALIDATION_ERROR
    } else {
        await generateAndSendOTP(patient)
    }
}

export const handlePatientRegistration = async (patientInfo) => {
    var alreadyRegisteredPatient = await Patient.findByPhoneNumber(patientInfo.phone)

    if (alreadyRegisteredPatient && alreadyRegisteredPatient.verified) {
        throw patientRegistrationEnums.ALREADY_REGISTERED_AND_VERIFIED
    } else if (alreadyRegisteredPatient && !alreadyRegisteredPatient.verified) {
        throw patientRegistrationEnums.ALREADY_REGISTERED_BUT_PENDING_VERIFICATION
    } else if (!alreadyRegisteredPatient) {
        await registerPatient(patientInfo)
    }
}