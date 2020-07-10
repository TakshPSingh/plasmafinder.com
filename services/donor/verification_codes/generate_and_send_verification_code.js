const {generateVerificationCode} = require('./generate_verification_code')
const {sendVerificationCode} = require('../../sms/verification_code/send_verification_code')

export const generateAndSendVerificationCode = async (donor) => {
    var verificationCode = await generateVerificationCode()

    donor.verificationCode = verificationCode
    donor.verificationAttemptedWithCurrentVerificationCode = false
    donor.numberOfTimesVerificationCodeSent++

    await donor.save()
    await sendVerificationCode(donor.phone, verificationCode)
}