const {mongoose} = require('../../../db/mongoose_connect')

const {Donor} = require('../../../models/donor')
const {Patient} = require('../../../models/patient')

const {handleDonorRegistration} = require('../../../services/donor/donor_registration')
const {handlePatientRegistration} = require('../../../services/patient/patient_registration')
const {verifyDonor} = require('../../../services/donor/donor_verification')
const {verifyPatient} = require('../../../services/patient/patient_verification')
const {matchPatientWithDonor} = require('../../../services/donation/match_patient_with_donor')
const {handleRequestToCancelDonation} = require('../../../services/donation/donation_cancellation')
const {handleVerificationCodeGeneration} = require('../../../services/donor/verification_codes/verification_code')

const {donationCancellationEnums} = require('../../../enums/donation_cancellation')

const {MAX_NUMBER_OF_VERIFICATION_CODE_VERIFICATIONS_ALLOWED} = require('../../../constants/verification_code')

const PATIENT_PHONE_NUMBER = '+919868711873'
const DONOR_ONE_PHONE_NUMBER = '+919910166009'
const DONOR_TWO_PHONE_NUMBER = '+919716610606'

beforeEach( async () => {
    await Donor.deleteMany()
    await Patient.deleteMany()
})

describe('donation canellation', () => {
    jest.setTimeout(20000)

    test('invalid phone number', async () => {
        try {
            await handleRequestToCancelDonation(DONOR_ONE_PHONE_NUMBER, 123456)
            throw 'handleRequestToCancelDonation did not throw anything' 
        } catch (error) {
            expect(error).toBe(donationCancellationEnums.DONOR_NOT_FOUND)
        }
    })

    test('valid donor but not assigned to a patient', async () => {
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

        try {
            await handleRequestToCancelDonation(DONOR_ONE_PHONE_NUMBER, 123456)
            throw 'handleRequestToCancelDonation did not throw anything' 
        } catch (error) {
            expect(error).toBe(donationCancellationEnums.NO_PENDING_DONATION_REQUEST_FOUND)
        }
    })

    test('valid donor and assigned to patient and no verification code supplied', async () => {
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
            phone: PATIENT_PHONE_NUMBER,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0.00001
            }
        }
        await handlePatientRegistration(patientInfo)

        var patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)
        await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp)

        await matchPatientWithDonor(patient)

        donor = await Donor.findByPhoneNumber(DONOR_ONE_PHONE_NUMBER)

        try {
            await handleRequestToCancelDonation(DONOR_ONE_PHONE_NUMBER, donor.verificationCode)
            throw 'handleRequestToCancelDonation did not throw anything' 
        } catch (error) {
            expect(error).toBe(donationCancellationEnums.INCORRECT_VERIFICATION_CODE_ANOTHER_ONE_SENT)
        }
    })

    test('valid donor and assigned to patient and incorrect verification code supplied', async () => {
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
            phone: PATIENT_PHONE_NUMBER,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0.00001
            }
        }
        await handlePatientRegistration(patientInfo)

        var patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)
        await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp)

        await matchPatientWithDonor(patient)
        await handleVerificationCodeGeneration(DONOR_ONE_PHONE_NUMBER)

        donor = await Donor.findByPhoneNumber(DONOR_ONE_PHONE_NUMBER)

        try {
            await handleRequestToCancelDonation(DONOR_ONE_PHONE_NUMBER, donor.verificationCode + 1)
            throw 'handleRequestToCancelDonation did not throw anything' 
        } catch (error) {
            expect(error).toBe(donationCancellationEnums.INCORRECT_VERIFICATION_CODE_ANOTHER_ONE_SENT)
        }
    })    

    test('valid donor and assigned to patient and correct verification code supplied', async () => {
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
            phone: PATIENT_PHONE_NUMBER,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0.00001
            }
        }
        await handlePatientRegistration(patientInfo)

        var patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)
        await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp)

        await matchPatientWithDonor(patient)
        await handleVerificationCodeGeneration(DONOR_ONE_PHONE_NUMBER)

        donor = await Donor.findByPhoneNumber(DONOR_ONE_PHONE_NUMBER)

        await handleRequestToCancelDonation(DONOR_ONE_PHONE_NUMBER, donor.verificationCode)
    
        donor = await Donor.findByPhoneNumber(DONOR_ONE_PHONE_NUMBER)

        checkIfDonorReset(donor)

        expect(donor.numberOfTimesDonated).toBe(0)
        expect(donor.cancelledDonations).toHaveLength(1)
        expect(donor.cancelledDonations[0].patientId).toStrictEqual(patient._id)
        expect(donor.cancelledDonations[0].cancelledAt).toBeLessThan(new Date().getTime())
    })

    test('run out of chances', async () => {
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
            phone: PATIENT_PHONE_NUMBER,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0.00001
            }
        }
        await handlePatientRegistration(patientInfo)

        var patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)
        await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp)

        await matchPatientWithDonor(patient)
        await handleVerificationCodeGeneration(DONOR_ONE_PHONE_NUMBER)

        for (var count = 0 ; count < MAX_NUMBER_OF_VERIFICATION_CODE_VERIFICATIONS_ALLOWED - 1; count++) {
            donor = await Donor.findByPhoneNumber(DONOR_ONE_PHONE_NUMBER)

            try {
                await handleRequestToCancelDonation(DONOR_ONE_PHONE_NUMBER, donor.verificationCode + 1)
            } catch (error) {
                expect(error).toBe(donationCancellationEnums.INCORRECT_VERIFICATION_CODE_ANOTHER_ONE_SENT)
            }
        }

        try {
            await handleRequestToCancelDonation(DONOR_ONE_PHONE_NUMBER, donor.verificationCode + 1)
            throw 'handleRequestToCompleteDonation did not throw anything'
        } catch (error) {
            expect(error).toBe(donationCancellationEnums.INCORRECT_VERIFICATION_CODE_AND_RAN_OUT_OF_CHANCES)
        }

        try {
            await handleRequestToCancelDonation(DONOR_ONE_PHONE_NUMBER, donor.verificationCode)
            throw 'handleRequestToCompleteDonation did not throw anything'
        } catch (error) {
            expect(error).toBe(donationCancellationEnums.RAN_OUT_OF_CHANCES)
        }
    })
})

function checkIfDonorReset (donor) {
    expect(donor.available).toBe(true)
    expect(donor.patientId).toBeUndefined()
    expect(donor.callsLeft).toBe(0)
    expect(donor.verificationCode).toBeUndefined()
    expect(donor.verificationAttemptedWithCurrentVerificationCode).toBeUndefined()
    expect(donor.numberOfTimesVerificationCodeSent).toBe(0)
}