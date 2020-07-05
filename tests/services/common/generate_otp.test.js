const {OTP_LENGTH} = require('../../../constants/otp')

const {generateOTP} = require('../../../services/common/generate_otp')

describe('generate OTP', () => {
    test('generate OTP', async () => {
        var otp = await generateOTP()

        var minimumPossibleOTP = 0
        var maximumPossibleOTP = 10 ** OTP_LENGTH

        expect(typeof otp).toBe('number')
        expect(otp).toBeGreaterThanOrEqual(minimumPossibleOTP)
        expect(otp).toBeLessThanOrEqual(maximumPossibleOTP)
    })
})