const {Patient} = require('../../models/patient')

const {patientRegistrationEnums} = require('../../enums/patient_registration')

const {generateOTP} = require('../../services/common/generate_otp')
const {sendOTP} = require('../../services/common/send_otp')

const registerPatient = async (patientInfo) => {
    var patient = new Patient(patientInfo)
    patient.numberOfTimesOTPSent = 0
    patient.verified = false

    var patientValidationError = patient.validateSync()
    if (patientValidationError) {
        throw patientRegistrationEnums.VALIDATION_ERROR
    } else {
        var otp = await generateOTP()

        patient.otp = otp
        patient.numberOfTimesOTPSent++
        await patient.save()

        await sendOTP(patient.phone, otp)
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