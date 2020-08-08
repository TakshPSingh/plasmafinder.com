const {sendSMS} = require('../send_sms')

export const notifyPatientOfDonationCancellation = async (patientPhone) => {
    var body = `Sorry, but your request for plasma has been cancelled. We're trying to find another donor for you. You can expect to hear from us soon.\nSincerely,\nplasmafinder.com`
    await sendSMS(body, patientPhone)
}