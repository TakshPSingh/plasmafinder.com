const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN

const client = require('twilio')(accountSid, authToken)

export const sendVerificationCode = async (phone, verificationCode) => {
    await client.messages.create({
        body: `Dear Donor, your verification code for plasmafinder.com is ${verificationCode}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
    })
}