const request = require('supertest')

const {app} = require('../../../server/app')
const {mongoose} = require('../../../db/mongoose_connect')

const {Donor} = require('../../../models/donor')

const {donorRegistrationEnums} = require('../../../enums/donor_registration')

beforeEach( async () => {
    await Donor.deleteMany()
})

describe('donor registration', () => {
    test('try to register new user with invalid email', async () => {
        var donorInfo = {
            name: 'nhajd',
            age: '22',
            medicallyEligible: true,
            bloodGroup: 'A',
            phone: '+919868711873',
            email: 'adasdsad',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        await request(app)
        .post('/api/donor/register')
        .send({ donorInfo })
        .expect(400)
        .then((response) => {
            expect(response.body.errorCode).toBe(donorRegistrationEnums.VALIDATION_ERROR)
        })
    })

    test('try to register new user with invalid phone', async () => {
        var donorInfo = {
            name: 'nhajd',
            age: '22',
            medicallyEligible: true,
            bloodGroup: 'A',
            phone: '+11873',
            email: 'abcdefgh@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        await request(app)
        .post('/api/donor/register')
        .send({ donorInfo })
        .expect(400)
        .then((response) => {
            expect(response.body.errorCode).toBe(donorRegistrationEnums.VALIDATION_ERROR)
        })
    })

    test('try to register new user with valid info', async () => {
        var donorInfo = {
            name: 'nhajd',
            age: '22',
            medicallyEligible: true,
            bloodGroup: 'A',
            phone: '+919868711873',
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
    })

    test('try to register with already registered but not verified user', async () => {
        var donorInfo = {
            name: 'nhajd',
            age: '22',
            medicallyEligible: true,
            bloodGroup: 'A',
            phone: '+919868711873',
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

        await request(app)
        .post('/api/donor/register')
        .send({ donorInfo })
        .expect(400)
        .then((response) => {
            expect(response.body.errorCode).toBe(donorRegistrationEnums.ALREADY_REGISTERED_BUT_PENDING_VERIFICATION)
        })
    })

    test('try to register with already registered and verified user', async () => {
        var donorInfo = {
            name: 'nhajd',
            age: '22',
            medicallyEligible: true,
            bloodGroup: 'A',
            phone: '+919868711873',
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

        var donor = await Donor.findByPhoneNumber(donorInfo.phone)
        donor.verified = true
        await donor.save()

        await request(app)
        .post('/api/donor/register')
        .send({ donorInfo })
        .expect(400)
        .then((response) => {
            expect(response.body.errorCode).toBe(donorRegistrationEnums.ALREADY_REGISTERED_AND_VERIFIED)
        })
    })
})