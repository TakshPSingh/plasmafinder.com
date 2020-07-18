const request = require('supertest')

const {app} = require('../../../server/app')
const {mongoose} = require('../../../db/mongoose_connect')

const {Donor} = require('../../../models/donor')
const {Patient} = require('../../../models/patient')

const {handleDonorRegistration} = require('../../../services/donor/donor_registration')
const {handlePatientRegistration} = require('../../../services/patient/patient_registration')
const {verifyDonor} = require('../../../services/donor/donor_verification')
const {verifyPatient} = require('../../../services/patient/patient_verification')
const {matchPatientWithDonor} = require('../../../services/donation/match_patient_with_donor')

const {MAX_DURATION_OF_CALL_BY_DONOR} = require('../../../constants/calls')

const DONOR_ONE_PHONE_NUMBER = '+919868711873'
const PATIENT_ONE_PHONE_NUMBER = '+919716610606'

beforeEach(async () => {
    await Donor.deleteMany()
    await Patient.deleteMany()
})

describe('Route: /api/call/donor', () => {
    test('invalid api key', async () => {
        await request(app)
        .get('/api/call/donor/1234')
        .send()
        .expect(401)
    })

    test('invalid donor phone number', async () => {
        await request(app)
        .get(`/api/call/donor/${process.env.CALL_API_KEY}`)
        .send()
        .expect(200)
        .then((response) => {
            expect(response.body.destination.numbers).toHaveLength(1)
            expect(response.body.destination.numbers[0]).toBeNull()
            expect(response.body.max_conversation_duration).toBe(MAX_DURATION_OF_CALL_BY_DONOR)
        })
    })

    test('valid donor assigned to patient', async () => {
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
            name: 'Patient',
            age: '22',
            bloodGroup: 'A',
            phone: PATIENT_ONE_PHONE_NUMBER,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0.00001
            }
        }
        await handlePatientRegistration(patientInfo)

        var patient = await Patient.findByPhoneNumber(PATIENT_ONE_PHONE_NUMBER)
        await verifyPatient(PATIENT_ONE_PHONE_NUMBER, patient.otp)

        var {patient, assignedDonor} = await matchPatientWithDonor(patient)

        await request(app)
        .get(`/api/call/donor/${process.env.CALL_API_KEY}`)
        .send({
            From: donor.phone
        })
        .expect(200)
        .then((response) => {
            expect(response.body.destination.numbers).toHaveLength(1)
            expect(response.body.destination.numbers[0]).toBe(patient.phone)
            expect(response.body.max_conversation_duration).toBe(MAX_DURATION_OF_CALL_BY_DONOR)
        })
    })
})