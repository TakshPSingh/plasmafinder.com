const {Donor} = require('../../models/donor')

const {verifyDonationCompletionOrCancellationRequest} = require('../donor/verify_donation_cancellation_or_completion_request')
const {resetDonorAfterDonationCancelledOrCompleted} = require('../donor/donor_reset_after_donation_cancelled_or_completed')

const {donationCancellationEnums} = require('../../enums/donation_cancellation')
const {verifyDonationCompletionOrCancellationRequestEnums} = require('../../enums/verify_donation_completion_or_cancellation_request')

const cancelDonationAfterVerification = async (donor) => {
    donor.cancelledDonations.push({
        patientId: donor.patientId,
        cancelledAt: new Date().getTime()
    })
    resetDonorAfterDonationCancelledOrCompleted(donor)
    await donor.save()
}

const cancelDonation = async (donor, verificationCode) => {
    try {
        await verifyDonationCompletionOrCancellationRequest(donor, verificationCode)
        await cancelDonationAfterVerification(donor)
    } catch (error) {
        if (error === verifyDonationCompletionOrCancellationRequestEnums.INCORRECT_VERIFICATION_CODE_ANOTHER_ONE_SENT) {
            throw donationCancellationEnums.INCORRECT_VERIFICATION_CODE_ANOTHER_ONE_SENT
        } else if (error === verifyDonationCompletionOrCancellationRequestEnums.INCORRECT_VERIFICATION_CODE_AND_RAN_OUT_OF_CHANCES) {
            throw donationCancellationEnums.INCORRECT_VERIFICATION_CODE_AND_RAN_OUT_OF_CHANCES
        } else if (error === verifyDonationCompletionOrCancellationRequestEnums.RAN_OUT_OF_CHANCES) {
            throw donationCancellationEnums.RAN_OUT_OF_CHANCES
        } else {
            throw donationCancellationEnums.UNEXPECTED_ERROR
        }
    }
}

const handleRequestToCancelDonationWhenDonorFound = async (donor, verificationCode) => {
    if (donor.patientId) {
        await cancelDonation(donor, verificationCode)
    } else {
        throw donationCancellationEnums.NO_PENDING_DONATION_REQUEST_FOUND
    }
}

export const handleRequestToCancelDonation = async (phone, verificationCode) => {
    var donor = await Donor.findByPhoneNumber(phone)

    if (donor) {
        await handleRequestToCancelDonationWhenDonorFound(donor, verificationCode)
    } else {
        throw donationCancellationEnums.DONOR_NOT_FOUND
    }
}