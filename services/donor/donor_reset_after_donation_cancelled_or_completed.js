export const resetDonorAfterDonationCancelledOrCompleted = (donor) => {
    donor.available = true
    donor.callsLeft = 0
    donor.numberOfTimesVerificationCodeSent = 0

    donor.patientId = undefined
    donor.verificationCode = undefined
    donor.verificationAttemptedWithCurrentVerificationCode = undefined
}