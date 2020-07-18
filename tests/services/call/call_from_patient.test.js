const {mongoose} = require('../../../db/mongoose_connect')

const {Donor} = require('../../../models/donor')
const {Patient} = require('../../../models/patient')

const {handleDonorRegistration} = require('../../../services/donor/donor_registration')
const {handlePatientRegistration} = require('../../../services/patient/patient_registration')
const {verifyDonor} = require('../../../services/donor/donor_verification')
const {verifyPatient} = require('../../../services/patient/patient_verification')
const {matchPatientWithDonor} = require('../../../services/donation/match_patient_with_donor')
const {handleCallRequestFromPatient} = require('../../../services/call/call_from_patient')

const {MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_PATIENT} = require('../../../constants/calls')

const DONOR_ONE_PHONE_NUMBER = '+919868711873'
const PATIENT_ONE_PHONE_NUMBER = '+919716610606'

beforeEach(async () => {
    await Donor.deleteMany()
    await Patient.deleteMany()

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
})

describe('call from patient', () => {
    test('invalid patient phone number', async () => {
        var donorPhoneNumber  = await handleCallRequestFromPatient('+919910166009')
        expect(donorPhoneNumber).toBeUndefined()
    })

    test('valid donor phone number but no calls left', async () => {
        var donorPhoneNumber = await handleCallRequestFromPatient(PATIENT_ONE_PHONE_NUMBER)
        expect(donorPhoneNumber).toBeUndefined()

        var patient = await Patient.findByPhoneNumber(PATIENT_ONE_PHONE_NUMBER)
        expect(patient.callsLeft).toBe(0)
    })

    test('valid donor phone number with valid patient linked', async () => {
        var patient = await Patient.findByPhoneNumber(PATIENT_ONE_PHONE_NUMBER)
        await verifyPatient(PATIENT_ONE_PHONE_NUMBER, patient.otp)

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

        var {patient, assignedDonor} = await matchPatientWithDonor(patient)

        var donorPhoneNumber = await handleCallRequestFromPatient(PATIENT_ONE_PHONE_NUMBER)
        expect(donorPhoneNumber).toBe(donor.phone)

        var patient = await Patient.findByPhoneNumber(PATIENT_ONE_PHONE_NUMBER)
        expect(patient.callsLeft).toBe(MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_PATIENT - 1)
    })
})