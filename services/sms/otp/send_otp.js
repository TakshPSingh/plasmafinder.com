const {sendSMS} = require('../send_sms')

export const sendOTP = async (phone, otp) => {
    var body = `Your OTP for plasmafinder.com is ${otp}`
    await sendSMS(body, phone)
}