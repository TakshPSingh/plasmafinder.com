const {Donor} = require('../../models/donor')

const {donorRegistrationEnums} = require('../../enums/donor_registration')

const {generateOTP} = require('../../services/common/generate_otp')
const {sendOTP} = require('../../services/common/send_otp')

const registerDonor = async (donorInfo) => {
    var donor = new Donor(donorInfo)
    donor.numberOfTimesOTPSent = 0
    donor.verified = false

    var donorValidationError = donor.validateSync()
    if (donorValidationError || !donor.medicallyEligible) {
        throw donorRegistrationEnums.VALIDATION_ERROR
    } else {
        var otp = await generateOTP()

        donor.otp = otp
        donor.numberOfTimesOTPSent++
        await donor.save()

        await sendOTP(donor.phone, otp)
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