const {Donor} = require('../../models/donor')

const {donorRegistrationEnums} = require('../../enums/donor_registration')

const {generateAndSendOTP} = require('../common/generate_and_send_otp')

const registerDonor = async (donorInfo) => {
    var donor = new Donor(donorInfo)
    
    donor.numberOfTimesDonated = 0
    donor.numberOfTimesOTPSent = 0
    donor.available = false
    donor.verified = false
    donor.callsLeft = 0

    delete donor.patientId
    delete donor.completedDonations
    delete donor.cancelledDonations

    delete donor.verificationCode
    delete donor.verificationAttemptedWithCurrentVerificationCode
    
    donor.numberOfTimesVerificationCodeSent = 0

    var donorValidationError = donor.validateSync()
    if (donorValidationError || !donor.medicallyEligible) {
        throw donorRegistrationEnums.VALIDATION_ERROR
    } else {
        await generateAndSendOTP(donor)
    }
}

export const handleDonorRegistration = async (donorInfo) => {
    var alreadyRegisteredDonor = await Donor.findByPhoneNumber(donorInfo.phone)

    if (alreadyRegisteredDonor && alreadyRegisteredDonor.verified) {
        throw donorRegistrationEnums.ALREADY_REGISTERED_AND_VERIFIED
    } else if (alreadyRegisteredDonor && !alreadyRegisteredDonor.verified) {
        throw donorRegistrationEnums.ALREADY_REGISTERED_BUT_PENDING_VERIFICATION
    } else if (!alreadyRegisteredDonor) {
        await registerDonor(donorInfo)
    }
}