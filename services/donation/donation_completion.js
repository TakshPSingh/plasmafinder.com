const {Donor} = require('../../models/donor')
const {Patient} = require('../../models/patient')

const {verifyDonationCompletionOrCancellationRequest} = require('../donor/verify_donation_cancellation_or_completion_request')
const {resetDonorAfterDonationCancelledOrCompleted} = require('../donor/donor_reset_after_donation_cancelled_or_completed')

const {donationCompletionEnums} = require('../../enums/donation_completion')
const {verifyDonationCompletionOrCancellationRequestEnums} = require('../../enums/verify_donation_completion_or_cancellation_request')

const completeRequestAfterVerification = async (donor) => {
    var patient = await Patient.findById(donor.patientId)
    patient.donorId = undefined
    await patient.save()

    donor.numberOfTimesDonated++
    donor.completedDonations.push({
        patientId: donor.patientId,
        completedAt: new Date().getTime()
    })
    resetDonorAfterDonationCancelledOrCompleted(donor)
    await donor.save()
}

const completeRequest = async (donor, verificationCode) => {
    try {
        await verifyDonationCompletionOrCancellationRequest(donor, verificationCode)
        await completeRequestAfterVerification(donor)    
    } catch (error) {
        if (error === verifyDonationCompletionOrCancellationRequestEnums.INCORRECT_VERIFICATION_CODE_ANOTHER_ONE_SENT) {
            throw donationCompletionEnums.INCORRECT_VERIFICATION_CODE_ANOTHER_ONE_SENT
        } else if (error === verifyDonationCompletionOrCancellationRequestEnums.INCORRECT_VERIFICATION_CODE_AND_RAN_OUT_OF_CHANCES) {
            throw donationCompletionEnums.INCORRECT_VERIFICATION_CODE_AND_RAN_OUT_OF_CHANCES
        } else if (error === verifyDonationCompletionOrCancellationRequestEnums.RAN_OUT_OF_CHANCES) {
            throw donationCompletionEnums.RAN_OUT_OF_CHANCES
        } else {
            throw donationCompletionEnums.UNEXPECTED_ERROR
        }
    }
}

const handleRequestToCompleteDonationWhenDonorFound = async (donor, verificationCode) => {
    if (donor.patientId) {
        await completeRequest(donor, verificationCode)
    } else {
        throw donationCompletionEnums.NO_PENDING_DONATION_REQUEST_FOUND
    }
}

export const handleRequestToCompleteDonation = async (phone, verificationCode) => {
    var donor = await Donor.findByPhoneNumber(phone)

    if (donor) {
        await handleRequestToCompleteDonationWhenDonorFound(donor, verificationCode)
    } else {
        throw donationCompletionEnums.DONOR_NOT_FOUND
    }
}