const request = require('supertest')

const {app} = require('../../../server/app')
const {mongoose} = require('../../../db/mongoose_connect')

const {Donor} = require('../../../models/donor')

const {donorVerificationEnums} = require('../../../enums/donor_verification')

const DONOR_ONE_PHONE_NUMBER = '+919868711873'

beforeEach( async () => {
    await Donor.deleteMany()
})

describe('donor verification', () => {
    test('invalid verification', async () => {
        var donorInfo = {
            name: 'nhajd',
            age: '22',
            medicallyEligible: true,
            bloodGroup: 'A',
            phone: DONOR_ONE_PHONE_NUMBER,
            email: 'abcdefgh@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        await request(app)
        .post('/api/donor/register')
        .send({ donorInfo })
        .expect(200)

        var donor = await Donor.findByPhoneNumber(DONOR_ONE_PHONE_NUMBER)

        await request(app)
        .post('/api/donor/verify')
        .send({
            phone: donor.phone,
            otp: donor.otp + 1
        })
        .expect(400)
        .then((response) => {
            expect(response.body.errorCode).toBe(donorVerificationEnums.INCORRECT_OTP_ANOTHER_ONE_SENT)
        })
    })

    test('valid verification', async () => {
        var donorInfo = {
            name: 'nhajd',
            age: '22',
            medicallyEligible: true,
            bloodGroup: 'A',
            phone: DONOR_ONE_PHONE_NUMBER,
            email: 'abcdefgh@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        await request(app)
        .post('/api/donor/register')
        .send({ donorInfo })
        .expect(200)

        var donor = await Donor.findByPhoneNumber(DONOR_ONE_PHONE_NUMBER)

        await request(app)
        .post('/api/donor/verify')
        .send({
            phone: donor.phone,
            otp: donor.otp
        })
        .expect(200)
    })
})