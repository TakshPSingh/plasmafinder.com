const {generateOTP} = require('../common/generate_otp')
const {sendOTP} = require('../common/send_otp')

export const generateAndSendOTP = async (user) => {
    var otp = await generateOTP()

    user.otp = otp
    user.verificationAttemptedWithCurrentOTP = false
    user.numberOfTimesOTPSent++
    await user.save()

    await sendOTP(user.phone, otp)
}