const {mongoose} = require('../../../db/mongoose_connect')

const {Donor} = require('../../../models/donor')
const {Patient} = require('../../../models/patient')

const {handleDonorRegistration} = require('../../../services/donor/donor_registration')
const {handlePatientRegistration} = require('../../../services/patient/patient_registration')
const {verifyDonor} = require('../../../services/donor/donor_verification')
const {verifyPatient} = require('../../../services/patient/patient_verification')
const {matchPatientWithDonor} = require('../../../services/donation/match_patient_with_donor')
const {handleCallRequestFromDonor} = require('../../../services/call/call_from_donor')

const {MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_DONOR} = require('../../../constants/calls')

const DONOR_ONE_PHONE_NUMBER = '+919868711873'
const PATIENT_ONE_PHONE_NUMBER = '+919716610606'

beforeEach(async () => {
    await Donor.deleteMany()
    await Patient.deleteMany()

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
})

describe('call from donor', () => {
    test('invalid donor phone number', async () => {
        var patientPhoneNumber = await handleCallRequestFromDonor('+919910166009')
        expect(patientPhoneNumber).toBeUndefined()
    })

    test('valid donor phone number but no calls left', async () => {
        var patientPhoneNumber = await handleCallRequestFromDonor(DONOR_ONE_PHONE_NUMBER)
        expect(patientPhoneNumber).toBeUndefined()

        var donor = await Donor.findByPhoneNumber(DONOR_ONE_PHONE_NUMBER)
        expect(donor.callsLeft).toBe(0)
    })

    test('valid donor phone number with valid patient linked', async () => {
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

        var patientPhoneNumber = await handleCallRequestFromDonor(DONOR_ONE_PHONE_NUMBER)
        expect(patientPhoneNumber).toBe(patient.phone)

        var donor = await Donor.findByPhoneNumber(DONOR_ONE_PHONE_NUMBER)
        expect(donor.callsLeft).toBe(MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_DONOR - 1)
    })
})