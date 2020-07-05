const randomize = require('randomatic')

const {OTP_LENGTH, OTP_RADIX} = require('../../constants/otp')

if (!randomize.isCrypto) {
    throw 'randomatic not using a cryptographically secure method'
}

export const generateOTP = async () => {
    var otpString = await randomize('0', OTP_LENGTH)
    return parseInt(otpString, OTP_RADIX)
}