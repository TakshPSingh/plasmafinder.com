const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN

const client = require('twilio')(accountSid, authToken)

const {MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_PATIENT, MAX_DURATION_OF_CALL_BY_PATIENT, MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_DONOR, MAX_DURATION_OF_CALL_BY_DONOR} = require('../../../constants/calls')

const notifyPatientOfMatch = (patientPhone) => {
    const callDurationLimitInMinutes = MAX_DURATION_OF_CALL_BY_PATIENT / 60
    return client.messages.create({
        body: `Congratulations, you have been matched with a donor.\nPlease call ${process.env.PHONE_NUMBER_FOR_PATIENTS_TO_CALL} to talk to them.\nYou can call this number upto ${MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_PATIENT} times and each call can last upto ${callDurationLimitInMinutes} mins. And as soon as you start trusting the donor, please ask them to share their phone number and contact them directly after that\nSincerely,\nplasmafinder.com`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: patientPhone
    })
}

const notifyDonorOfMatch = (donorPhone) => {
    const callDurationLimitInMinutes = MAX_DURATION_OF_CALL_BY_DONOR / 60
    return client.messages.create({
        body: `Dear Plasma Donor,\nHope you're having a great day! You've been matched with a patient.\nPlease call ${process.env.PHONE_NUMBER_FOR_DONORS_TO_CALL} to talk to them. You can call this number upto ${MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_DONOR} times and each call can last upto ${callDurationLimitInMinutes} mins. And as soon as you start trusting the patient, please ask them to share their phone number and contact them directly after that.\nAnd please visit http://www.plasmafinder.com/inform to inform us after you have completed this request or to cancel it. Please make sure that you do this since this will help us update our records and help us requests in the future accordingly\nSincerely,\nplasmafinder.com`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: donorPhone
    })
}

export const notifyPatientAndDonorOfMatch = async (patientPhone, donorPhone) => {
    await notifyPatientOfMatch(patientPhone)
    await notifyDonorOfMatch(donorPhone)
}

export const notifyPatientOfUnsuccessfulMatch = async (patientPhone) => {
    await client.messages.create({
        body: `We're sorry to inform you that we were unable to match you with a plasma donor.\nSincerely,\nplasmafinder.com`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: patientPhone
    })
}