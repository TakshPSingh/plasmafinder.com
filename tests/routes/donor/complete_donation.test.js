const request = require('supertest')

const {app} = require('../../../server/app')
const {mongoose} = require('../../../db/mongoose_connect')

const {Donor} = require('../../../models/donor')
const {Patient} = require('../../../models/patient')

const {handleDonorRegistration} = require('../../../services/donor/donor_registration')
const {verifyDonor} = require('../../../services/donor/donor_verification')
const {handlePatientRegistration} = require('../../../services/patient/patient_registration')
const {verifyPatient} = require('../../../services/patient/patient_verification')
const {matchPatientWithDonor} = require('../../../services/donation/match_patient_with_donor')
const {handleVerificationCodeGeneration} = require('../../../services/donor/verification_codes/verification_code')

const {donationCompletionEnums} = require('../../../enums/donation_completion')

const DONOR_ONE_PHONE_NUMBER = '+919868711873'
const PATIENT_ONE_PHONE_NUMBER = '+919716610606'

beforeEach( async () => {
    await Donor.deleteMany()
    await Patient.deleteMany()
})

describe('Route: /api/donor/complete-donation', () => {
    test('invalid donor', async () => {
        await request(app)
        .post('/api/donor/complete-donation')
        .send()
        .expect(400)
        .then((response) => {
            expect(response.body.errorCode).toBe(donationCompletionEnums.DONOR_NOT_FOUND)
        })
    })

    test('valid donor and valid completion of donation', async () => {
        var donorInfo = {
            name: 'Donor',
            age: '22',
            bloodGroup: 'A',
            phone: DONOR_ONE_PHONE_NUMBER,
            medicallyEligible: true,
            email: 'abcd@gmail.com',
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

        await matchPatientWithDonor(patient)
        await handleVerificationCodeGeneration(DONOR_ONE_PHONE_NUMBER)

        donor = await Donor.findByPhoneNumber(DONOR_ONE_PHONE_NUMBER)

        await request(app)
        .post('/api/donor/complete-donation')
        .send({
            phone: DONOR_ONE_PHONE_NUMBER,
            verificationCode: donor.verificationCode
        })
        .expect(200)
    })
})