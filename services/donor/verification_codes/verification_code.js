const {Donor} = require('../../../models/donor')

const {generateAndSendVerificationCode} = require('./generate_and_send_verification_code')

const {generateVerificationCodeEnums} = require('../../../enums/verification_code')

const {MAX_NUMBER_OF_VERIFICATION_CODE_VERIFICATIONS_ALLOWED} = require('../../../constants/verification_code')

const generateVerificationCodeIfDonorHasChancesLeft = async (donor) => {
    if (donor.numberOfTimesVerificationCodeSent < MAX_NUMBER_OF_VERIFICATION_CODE_VERIFICATIONS_ALLOWED) {
        await generateAndSendVerificationCode(donor)
    } else {
        throw generateVerificationCodeEnums.RAN_OUT_OF_CHANCES
    }
}

const handleVerificationCodeGenerationWhenDonorValid = async (donor) => {
    if (donor.patientId) {
        await generateVerificationCodeIfDonorHasChancesLeft(donor)
    } else {
        throw generateVerificationCodeEnums.NO_PENDING_DONATION_REQUEST_FOUND
    }
}

export const handleVerificationCodeGeneration = async (phone) => {
    var donor = await Donor.findByPhoneNumber(phone)

    if (donor) {
        await handleVerificationCodeGenerationWhenDonorValid(donor)
    } else {
        throw generateVerificationCodeEnums.DONOR_NOT_FOUND
    }
}