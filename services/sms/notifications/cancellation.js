const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN

const client = require('twilio')(accountSid, authToken)

export const notifyPatientOfDonationCancellation = async (patientPhone) => {
    await client.messages.create({
        body: `Sorry, but your request for plasma has been cancelled.
        We're trying to find another donor for you.\n
        Sincerely,\n
        plasmafinder.com`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: patientPhone
    })
}