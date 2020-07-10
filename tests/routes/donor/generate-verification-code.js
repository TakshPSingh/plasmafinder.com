const request = require('supertest')

const {app} = require('../../../server/app')
const {mongoose} = require('../../../db/mongoose_connect')

const {Donor} = require('../../../models/donor')

const {generateVerificationCodeEnums} = require('../../../enums/verification_code')

const DONOR_ONE_PHONE_NUMBER = '+919868711873'

beforeEach( async () => {
    await Donor.deleteMany()
})

descibe('generate verfication code', () => {
    test('invalid donor', async () => {
        await request(app)
        .post('/api/donor/generate-verification-code')
        .send()
        .expect(400)
        .then((response) => {
            expect(response.body.errorCode).toBe(generateVerificationCodeEnums.DONOR_NOT_FOUND)
        })
    })

    test('valid donor', async () => {
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

        await handleDonorRegistration(donorInfo)
        var donor = await Donor.findByPhoneNumber(DONOR_ONE_PHONE_NUMBER)
        await verifyDonor(DONOR_ONE_PHONE_NUMBER, donor.otp)

        var patientInfo = {
            name: 'nhajd',
            age: '22',
            phone: PATIENT_ONE_PHONE_NUMBER,
            email: 'abcdefgh@gmail.com',
            bloodGroup: 'A',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        await handlePatientRegistration(patientInfo)
        var patient = await Patient.findByPhoneNumber(PATIENT_ONE_PHONE_NUMBER)
        await verifyPatient(PATIENT_ONE_PHONE_NUMBER, patient.otp)

        var {patient, assignedDonor} = await matchPatientWithDonor(patient)

        await request(app)
        .post('/api/donor/generate-verification-code')
        .send({
            phone: DONOR_ONE_PHONE_NUMBER
        })
        .expect(200)
    })
})