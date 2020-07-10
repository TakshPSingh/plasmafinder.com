const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN

const client = require('twilio')(accountSid, authToken)

export const notifyPatientAndDonorOfMatch = async (patientPhone, donorPhone) => {
    await client.messages.create({
        body: `You have been matched with a plasma donor.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: patientPhone
    })
    await client.messages.create({
        body: `You have been matched with a COVID-19 patient who needs plasma`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: donorPhone
    })
}

export const notifyPatientOfUnsuccessfulMatch = async (patientPhone) => {
    await client.messages.create({
        body: `We're sorry to inform you that we were unable to match you with a plasma donor.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: patientPhone
    })
}