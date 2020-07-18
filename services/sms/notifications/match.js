const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN

const client = require('twilio')(accountSid, authToken)

const {MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_PATIENT, MAX_DURATION_OF_CALL_BY_PATIENT, MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_DONOR, MAX_DURATION_OF_CALL_BY_DONOR} = require('../../../constants/calls')

const notifyPatientOfMatch = (patientPhone) => {
    const callDurationLimitInMinutes = MAX_DURATION_OF_CALL_BY_PATIENT / 60
    return client.messages.create({
        body: `You have been matched with a donor.
        Please call ${process.env.PHONE_NUMBER_FOR_PATIENTS_TO_CALL}.
        You can call this number upto ${MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_PATIENT} times
        and each call can last upto ${callDurationLimitInMinutes} mins.
        As soon as you start trusting the donor, please ask them to share their phone number and contact them directly after that\n
        Sincerely\n
        plasmafinder.com`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: patientPhone
    })
}

const notifyDonorOfMatch = (donorPhone) => {
    const callDurationLimitInMinutes = MAX_DURATION_OF_CALL_BY_DONOR / 60
    return client.messages.create({
        body: `You have been matched with a patient.
        Please call ${process.env.PHONE_NUMBER_FOR_DONORS_TO_CALL}.
        You can call this number upto ${MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_DONOR} times
        and each call can last upto ${callDurationLimitInMinutes} mins.
        As soon as you start trusting the patient, please ask them to share their phone number and contact them directly after that\n
        Visit plasmafinder.com/inform to complete/cancel this donation\n
        Sincerely\n
        plasmafinder.com`,
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
        body: `We're sorry to inform you that we were unable to match you with a plasma donor.\n
        Sincerely,\n
        plasmafinder.com`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: patientPhone
    })
}