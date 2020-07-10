const {Donor} = require('../../models/donor')

const {generateAndSendOTP} = require('../common/generate_and_send_otp')

const {donorVerificationEnums} = require('../../enums/donor_verification')

const {MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED} = require('../../constants/otp')

const handleVerificationCaseWhenOTPIncorrect = async (donor, phone, otp) => {
    if (donor.otp !== otp && donor.numberOfTimesOTPSent < MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED) {
        await generateAndSendOTP(donor)
        throw donorVerificationEnums.INCORRECT_OTP_ANOTHER_ONE_SENT
    } else if (donor.otp !== otp && donor.numberOfTimesOTPSent === MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED) {
        donor.verificationAttemptedWithCurrentOTP = true
        await donor.save()
        throw donorVerificationEnums.RAN_OUT_OF_CHANCES
    }
}

const handleCaseWhenOTPCorrectInFirstAttempt = async (donor) => {
    donor.verificationAttemptedWithCurrentOTP = true
    donor.verified = true
    donor.available = true
    await donor.save()
}

export const verifyDonor = async (phone, otp) => {
    var donor = await Donor.findByPhoneNumber(phone)

    if (!donor) {
        throw donorVerificationEnums.DONOR_NOT_FOUND
    } else if (donor.verified) {
        throw donorVerificationEnums.ALREADY_VERIFIED
    } else if (donor.otp === otp && !donor.verificationAttemptedWithCurrentOTP) {
        await handleCaseWhenOTPCorrectInFirstAttempt(donor)
    } else if (donor.otp === otp && donor.verificationAttemptedWithCurrentOTP) {
        throw donorVerificationEnums.RAN_OUT_OF_CHANCES
        // since if verification already attempted, then MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED must have been reached
    } else if (donor.otp !== otp) {
        await handleVerificationCaseWhenOTPIncorrect(donor, phone, otp)
    }
}