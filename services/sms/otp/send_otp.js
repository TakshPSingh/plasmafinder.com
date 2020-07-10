const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN

const client = require('twilio')(accountSid, authToken)

export const sendOTP = async (phone, otp) => {
    await client.messages.create({
        body: `Your OTP for plasmafinder.com is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
    })
}