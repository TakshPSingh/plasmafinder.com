const {Patient} = require('../../models/patient')

const {generateAndSendOTP} = require('../common/generate_and_send_otp')

const {patientVerficationEnums} = require('../../enums/patient_verification')

const {MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED} = require('../../constants/otp')

const handleVerificationCaseWhenOTPIncorrect = async (patient, phone, otp) => {
    if (patient.otp !== otp && patient.numberOfTimesOTPSent < MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED) {
        await generateAndSendOTP(patient)
        throw patientVerficationEnums.INCORRECT_OTP_ANOTHER_ONE_SENT
    } else if (patient.otp !== otp && patient.numberOfTimesOTPSent === MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED) {
        patient.verificationAttemptedWithCurrentOTP = true
        await patient.save()
        throw patientVerficationEnums.RAN_OUT_OF_CHANCES
    }
}

const handleCaseWhenOTPCorrectInFirstAttempt = async (patient) => {
    patient.verificationAttemptedWithCurrentOTP = true
    patient.verified = true
    await patient.save()
}

export const verifyPatient = async (phone, otp) => {
    var patient = await Patient.findByPhoneNumber(phone)

    if (!patient) {
        throw patientVerficationEnums.PATIENT_NOT_FOUND
    } else if (patient.verified) {
        throw patientVerficationEnums.ALREADY_VERIFIED
    } else if (patient.otp === otp && !patient.verificationAttemptedWithCurrentOTP) {
        await handleCaseWhenOTPCorrectInFirstAttempt(patient)
    } else if (patient.otp === otp && patient.verificationAttemptedWithCurrentOTP) {
        throw patientVerficationEnums.RAN_OUT_OF_CHANCES
        // since if verification already attempted, then MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED must have been reached
    } else if (patient.otp !== otp) {
        await handleVerificationCaseWhenOTPIncorrect(patient, phone, otp)
    }
}