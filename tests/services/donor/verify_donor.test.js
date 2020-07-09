const {mongoose} = require('../../../db/mongoose_connect')

const {Donor} = require('../../../models/donor')

const {verifyDonor} = require('../../../services/donor/donor_verification')
const {handleDonorRegistration} = require('../../../services/donor/donor_registration')

const {donorVerficationEnums} = require('../../../enums/donor_verification')

const {MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED} = require('../../../constants/otp')

const DONOR_PHONE_NUMBER = '+919868711873'

beforeEach( async () => {
    await Donor.deleteMany()

    var donorInfo = {
        name: 'nhajd',
        age: '22',
        medicallyEligible: true,
        phone: DONOR_PHONE_NUMBER,
        email: 'abcdefgh@gmail.com',
        bloodGroup: 'A',
        location: {
            latitude: 0,
            longitude: 0
        }
    }
    await handleDonorRegistration(donorInfo)
})

describe('verify donor', () => {
    jest.setTimeout(20000)

    test('invalid phone number', async () => {
        try {
            await verifyDonor('1',2)
            throw 'verifyDonor did not throw anything'
        } catch (error) {
            expect(error).toBe(donorVerficationEnums.DONOR_NOT_FOUND)
        }
    })

    test('already verified', async () => {
        var donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)
        await verifyDonor(DONOR_PHONE_NUMBER, donor.otp)

        try {
            await verifyDonor(DONOR_PHONE_NUMBER, donor.otp)
            throw 'verifyDonor did not throw anything'
        } catch (error) {
            expect(error).toBe(donorVerficationEnums.ALREADY_VERIFIED)
        }
    })

    test('valid verification', async () => {
        var donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)
        await verifyDonor(DONOR_PHONE_NUMBER, donor.otp)

        donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)
        expect(donor.verified).toBe(true)
    })

    test('invalid otp -> generate new one', async () => {
        var donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)

        try {
            await verifyDonor(DONOR_PHONE_NUMBER, donor.otp + 1)
            throw 'verifyDonor did not throw anything'
        } catch (error) {
            expect(error).toBe(donorVerficationEnums.INCORRECT_OTP_ANOTHER_ONE_SENT)
        }
    })

    test('reached MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED and then run out of chances', async () => {
        for (let count = 0; count < MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED - 1; count++) {
            let donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)

            try {
                await verifyDonor(DONOR_PHONE_NUMBER, donor.otp + 1)
                throw 'verifyDonor did not throw anything'
            } catch (error) {
                expect(error).toBe(donorVerficationEnums.INCORRECT_OTP_ANOTHER_ONE_SENT)
            }
        }

        let donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)

        try {
            await verifyDonor(DONOR_PHONE_NUMBER, donor.otp + 1)
            throw 'verifyDonor did not throw anything'
        } catch (error) {
            expect(error).toBe(donorVerficationEnums.RAN_OUT_OF_CHANCES)
        }
    })

    test('try verifying after running out of chances', async () => {
        for (let count = 0; count < MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED - 1; count++) {
            let donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)

            try {
                await verifyDonor(DONOR_PHONE_NUMBER, donor.otp + 1)
                throw 'verifyDonor did not throw anything'
            } catch (error) {
                expect(error).toBe(donorVerficationEnums.INCORRECT_OTP_ANOTHER_ONE_SENT)
            }
        }

        let donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)

        try {
            await verifyDonor(DONOR_PHONE_NUMBER, donor.otp + 1)
            throw 'verifyDonor did not throw anything'
        } catch (error) {
            expect(error).toBe(donorVerficationEnums.RAN_OUT_OF_CHANCES)
        }

        donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)

        try {
            await verifyDonor(DONOR_PHONE_NUMBER, donor.otp)
            throw 'verifyDonor did not throw anything'
        } catch (error) {
            expect(error).toBe(donorVerficationEnums.RAN_OUT_OF_CHANCES)
        }
    })
})