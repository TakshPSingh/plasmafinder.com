const randomize = require('randomatic')

const {VERIFICATION_CODE_LENGTH, VERIFICATION_CODE_RADIX} = require('../../../constants/verification_code')

if (!randomize.isCrypto) {
    throw 'randomatic not using a cryptographically secure method'
}

export const generateVerificationCode = async () => {
    var verificationCodeString = await randomize('0', VERIFICATION_CODE_LENGTH)
    return parseInt(verificationCodeString, VERIFICATION_CODE_RADIX)
}