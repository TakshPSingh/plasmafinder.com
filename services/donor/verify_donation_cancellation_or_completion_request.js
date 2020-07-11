const {generateAndSendVerificationCode} = require('./verification_codes/generate_and_send_verification_code')

const {verifyDonationCompletionOrCancellationRequestEnums} = require('../../enums/verify_donation_completion_or_cancellation_request')

const {MAX_NUMBER_OF_VERIFICATION_CODE_VERIFICATIONS_ALLOWED} = require('../../constants/verification_code')

const handleCaseWhenVerificationCodeIncorrect = async (donor) => {
    if (donor.numberOfTimesVerificationCodeSent < MAX_NUMBER_OF_VERIFICATION_CODE_VERIFICATIONS_ALLOWED) {
        await generateAndSendVerificationCode(donor)
        throw verifyDonationCompletionOrCancellationRequestEnums.INCORRECT_VERIFICATION_CODE_ANOTHER_ONE_SENT
    } else if (donor.numberOfTimesVerificationCodeSent === MAX_NUMBER_OF_VERIFICATION_CODE_VERIFICATIONS_ALLOWED) {
        donor.verificationAttemptedWithCurrentVerificationCode = true
        await donor.save()
        throw verifyDonationCompletionOrCancellationRequestEnums.INCORRECT_VERIFICATION_CODE_AND_RAN_OUT_OF_CHANCES
    }
}

const handleCaseWhenVerificationCodeCorrect = async (donor) => {
    donor.verificationAttemptedWithCurrentVerificationCode = true
}

export const verifyDonationCompletionOrCancellationRequest = async (donor, verificationCode) => {
    if (donor.verificationAttemptedWithCurrentVerificationCode) {
        throw verifyDonationCompletionOrCancellationRequestEnums.RAN_OUT_OF_CHANCES
    } else if (donor.verificationCode === undefined || donor.verificationCode !== verificationCode){
        await handleCaseWhenVerificationCodeIncorrect(donor)
    } else if (donor.verificationCode === verificationCode) {
        await handleCaseWhenVerificationCodeCorrect(donor)
    }
}