const {sendSMS} = require('../send_sms')

export const sendVerificationCode = async (phone, verificationCode) => {
    var body = `Your verification code for plasmafinder.com is ${verificationCode}`
    await sendSMS(body, phone)
}