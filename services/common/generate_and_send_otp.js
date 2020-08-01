const {generateOTP} = require('./generate_otp')
const {sendOTP} = require('../sms/otp/send_otp')

export const generateAndSendOTP = async (user) => {
    var otp = await generateOTP()

    user.otp = otp
    user.verificationAttemptedWithCurrentOTP = false
    user.numberOfTimesOTPSent++
    await user.save()

    await sendOTP(user.phone, user.otp)
}