const {mongoose} = require('../../../../db/mongoose_connect')

const {Donor} = require('../../../../models/donor')
const {Patient} = require('../../../../models/patient')

const {handleDonorRegistration} = require('../../../../services/donor/donor_registration')
const {handlePatientRegistration} = require('../../../../services/patient/patient_registration')
const {verifyDonor} = require('../../../../services/donor/donor_verification')
const {verifyPatient} = require('../../../../services/patient/patient_verification')
const {handleVerificationCodeGeneration} = require('../../../../services/donor/verification_codes/verification_code')
const {matchPatientWithDonor} = require('../../../../services/donation/match_patient_with_donor')

const {generateVerificationCodeEnums} = require('../../../../enums/verification_code')

const {MAX_NUMBER_OF_VERIFICATION_CODE_VERIFICATIONS_ALLOWED} = require('../../../../constants/verification_code')

const DONOR_ONE_PHONE_NUMBER = '+919868711873'
const PATIENT_ONE_PHONE_NUMBER = '+919716610606'

beforeEach( async () => {
    await Donor.deleteMany()
    await Patient.deleteMany()
})

describe('verification code generation', () => {
    jest.setTimeout(20000)

    test('invalid donor phone number', async () => {
        try {
            await handleVerificationCodeGeneration(DONOR_ONE_PHONE_NUMBER)
            throw 'handleVerificationCodeGeneration did not throw anything'
        } catch (error) {
            expect(error).toBe(generateVerificationCodeEnums.DONOR_NOT_FOUND)
        }
    })

    test('donor does not have a pending request', async () => {
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

        try {
            await handleVerificationCodeGeneration(DONOR_ONE_PHONE_NUMBER)
            throw 'handleVerificationCodeGeneration did not throw anything'
        } catch (error) {
            expect(error).toBe(generateVerificationCodeEnums.NO_PENDING_DONATION_REQUEST_FOUND)
        }
    })

    test('pass all valid data and generate verification code', async () => {
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

        await handleVerificationCodeGeneration(DONOR_ONE_PHONE_NUMBER)
        donor = await Donor.findByPhoneNumber(DONOR_ONE_PHONE_NUMBER)
        
        expect(donor.patientId).not.toBeNull()
        expect(donor.verificationCode).not.toBeNull()
        expect(donor.verificationAttemptedWithCurrentVerificationCode).toBe(false)
        expect(donor.numberOfTimesVerificationCodeSent).toBe(1)      
    })

    test('run out of chances', async () => {
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

        for (let index = 0 ; index < MAX_NUMBER_OF_VERIFICATION_CODE_VERIFICATIONS_ALLOWED; index++) {
            await handleVerificationCodeGeneration(DONOR_ONE_PHONE_NUMBER)
        }

        try {
            await handleVerificationCodeGeneration(DONOR_ONE_PHONE_NUMBER)
            throw 'handleVerificationCodeGeneration did not throw anything'
        } catch (error) {
            expect(error).toBe(generateVerificationCodeEnums.RAN_OUT_OF_CHANCES)
        }
    })
})