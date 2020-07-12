const request = require('supertest')

const {app} = require('../../../server/app')
const {mongoose} = require('../../../db/mongoose_connect')

const {Patient} = require('../../../models/patient')

const {handlePatientRegistration} = require('../../../services/patient/patient_registration')

const {patientVerificationEnums} = require('../../../enums/patient_verification')

const PATIENT_PHONE_NUMBER = '+919868711873'

beforeEach( async () => {
    await Patient.deleteMany()
})

describe('patient verification', () => {
    test('invalid patient', async () => {
        await request(app)
        .post('/api/patient/verify')
        .send()
        .expect(400)
        .then((response) => {
            expect(response.body.errorCode).toBe(patientVerificationEnums.PATIENT_NOT_FOUND)
        })
    })

    test('valid patient and OTP', async () => {
        var patientInfo = {
            name: 'nhajd',
            age: '22',
            phone: PATIENT_PHONE_NUMBER,
            email: 'abcdefgh@gmail.com',
            bloodGroup: 'A',
            location: {
                latitude: 0,
                longitude: 0
            }
        }
        await handlePatientRegistration(patientInfo)

        var patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)

        await request(app)
        .post('/api/patient/verify')
        .send({
            phone: PATIENT_PHONE_NUMBER,
            otp: patient.otp
        })
        .expect(200)
    })
})