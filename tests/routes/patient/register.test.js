const request = require('supertest')

const {app} = require('../../../server/app')
const {mongoose} = require('../../../db/mongoose_connect')

const {Patient} = require('../../../models/patient')

const {patientRegistrationEnums} = require('../../../enums/patient_registration')

beforeEach( async () => {
    await Patient.deleteMany()
})

describe('patient registration', () => {
    test('try to register new user with invalid email', async () => {
        var patientInfo = {
            name: 'nhajd',
            age: '22',
            phone: '+919868711873',
            email: 'adasdsad',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        await request(app)
        .post('/api/patient/register')
        .send({ patientInfo })
        .expect(400)
        .then((response) => {
            expect(response.body.errorCode).toBe(patientRegistrationEnums.VALIDATION_ERROR)
        })
    })

    test('try to register new user with invalid phone', async () => {
        var patientInfo = {
            name: 'nhajd',
            age: '22',
            phone: '+11873',
            email: 'abcdefgh@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        await request(app)
        .post('/api/patient/register')
        .send({ patientInfo })
        .expect(400)
        .then((response) => {
            expect(response.body.errorCode).toBe(patientRegistrationEnums.VALIDATION_ERROR)
        })
    })

    test('try to register new user with valid info', async () => {
        var patientInfo = {
            name: 'nhajd',
            age: '22',
            phone: '+919868711873',
            email: 'abcdefgh@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        await request(app)
        .post('/api/patient/register')
        .send({ patientInfo })
        .expect(200)
    })

    test('try to register with already registered but not verified user', async () => {
        var patientInfo = {
            name: 'nhajd',
            age: '22',
            phone: '+919868711873',
            email: 'abcdefgh@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        await request(app)
        .post('/api/patient/register')
        .send({ patientInfo })
        .expect(200)

        await request(app)
        .post('/api/patient/register')
        .send({ patientInfo })
        .expect(400)
        .then((response) => {
            expect(response.body.errorCode).toBe(patientRegistrationEnums.ALREADY_REGISTERED_BUT_PENDING_VERIFICATION)
        })
    })

    test('try to register with already registered and verified user', async () => {
        var patientInfo = {
            name: 'nhajd',
            age: '22',
            phone: '+919868711873',
            email: 'abcdefgh@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }
       
        await request(app)
        .post('/api/patient/register')
        .send({ patientInfo })
        .expect(200)

        var patient = await Patient.findByPhoneNumber(patientInfo.phone)
        patient.verified = true
        await patient.save()

        await request(app)
        .post('/api/patient/register')
        .send({ patientInfo })
        .expect(400)
        .then((response) => {
            expect(response.body.errorCode).toBe(patientRegistrationEnums.ALREADY_REGISTERED_AND_VERIFIED)
        })
    })
})