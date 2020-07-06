const {mongoose} = require('../../../db/mongoose_connect')

const {Patient} = require('../../../models/patient')

const {verifyPatient} = require('../../../services/patient/patient_verification')
const {handlePatientRegistration} = require('../../../services/patient/patient_registration')

const {patientVerficationEnums} = require('../../../enums/patient_verification')

const {MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED} = require('../../../constants/otp')

const PATIENT_PHONE_NUMBER = '+919868711873'

beforeEach( async () => {
    await Patient.deleteMany()

    var patientInfo = {
        name: 'nhajd',
        age: '22',
        phone: PATIENT_PHONE_NUMBER,
        email: 'abcdefgh@gmail.com',
        location: {
            latitude: 0,
            longitude: 0
        }
    }
    await handlePatientRegistration(patientInfo)
})

describe('verify patient', () => {
    jest.setTimeout(15000)

    test('invalid phone number', async () => {
        try {
            await verifyPatient('1',2)
            throw 'verifyPatient did not throw anything'
        } catch (error) {
            expect(error).toBe(patientVerficationEnums.PATIENT_NOT_FOUND)
        }
    })

    test('already verified', async () => {
        var patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)
        await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp)

        try {
            await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp)
            throw 'verifyPatient did not throw anything'
        } catch (error) {
            expect(error).toBe(patientVerficationEnums.ALREADY_VERIFIED)
        }
    })

    test('valid verification', async () => {
        var patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)
        await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp)

        patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)
        expect(patient.verified).toBe(true)
    })

    test('invalid otp -> generate new one', async () => {
        var patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)

        try {
            await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp + 1)
            throw 'verifyPatient did not throw anything'
        } catch (error) {
            expect(error).toBe(patientVerficationEnums.INCORRECT_OTP_ANOTHER_ONE_SENT)
        }
    })

    test('reached MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED and then run out of chances', async () => {
        for (let count = 0; count < MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED - 1; count++) {
            let patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)

            try {
                await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp + 1)
                throw 'verifyPatient did not throw anything'
            } catch (error) {
                expect(error).toBe(patientVerficationEnums.INCORRECT_OTP_ANOTHER_ONE_SENT)
            }
        }

        let patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)

        try {
            await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp + 1)
            throw 'verifyPatient did not throw anything'
        } catch (error) {
            expect(error).toBe(patientVerficationEnums.RAN_OUT_OF_CHANCES)
        }
    })

    test('try verifying after running out of chances', async () => {
        for (let count = 0; count < MAX_NUMBER_OF_OTP_VERIFICATIONS_ALLOWED - 1; count++) {
            let patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)

            try {
                await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp + 1)
                throw 'verifyPatient did not throw anything'
            } catch (error) {
                expect(error).toBe(patientVerficationEnums.INCORRECT_OTP_ANOTHER_ONE_SENT)
            }
        }

        let patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)

        try {
            await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp + 1)
            throw 'verifyPatient did not throw anything'
        } catch (error) {
            expect(error).toBe(patientVerficationEnums.RAN_OUT_OF_CHANCES)
        }

        patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)

        try {
            await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp)
            throw 'verifyPatient did not throw anything'
        } catch (error) {
            expect(error).toBe(patientVerficationEnums.RAN_OUT_OF_CHANCES)
        }
    })
})