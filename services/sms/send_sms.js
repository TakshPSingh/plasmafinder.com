const axios = require('axios')
const querystring = require('querystring');

var smsRequestUrl = process.env.EXOTEL_SMS_API_URL
var exotelSenderId = process.env.EXOTEL_SENDER_ID

export const sendSMS = async (body, recipientPhoneNumber) => {
    var requestBody = {
        From: exotelSenderId,
        To: recipientPhoneNumber,
        Body: body
    }
    await axios.post(smsRequestUrl, querystring.stringify(requestBody))
}