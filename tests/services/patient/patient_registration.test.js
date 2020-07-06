const {mongoose} = require('../../../db/mongoose_connect')

const {Patient} = require('../../../models/patient')

const {handlePatientRegistration} = require('../../../services/patient/patient_registration')

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

        try {
            await handlePatientRegistration(patientInfo)
            throw 'handlePatientRegistration did not throw anything'
        } catch (error) {
            expect(error).toBe(patientRegistrationEnums.VALIDATION_ERROR)
        }
    })

    test('try to register new user with invalid phone', async () => {
        var patientInfo = {
            name: 'nhajd',
            age: '22',
            medicallyEligible: true,
            phone: '+11873',
            email: 'abcdefgh@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        try {
            await handlePatientRegistration(patientInfo)
            throw 'handlePatientRegistration did not throw anything'
        } catch (error) {
            expect(error).toBe(patientRegistrationEnums.VALIDATION_ERROR)
        }
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

        try {
            await handlePatientRegistration(patientInfo)
            expect(true).toBe(true)
        } catch (error) {
            console.log('error: ', error)
            expect(true).toBe(false)
        }
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

        await handlePatientRegistration(patientInfo)

        try {
            await handlePatientRegistration(patientInfo)
            throw 'handlePatientRegistration did not throw anything'
        } catch (error) {
            expect(error).toBe(patientRegistrationEnums.ALREADY_REGISTERED_BUT_PENDING_VERIFICATION)
        }
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
        await handlePatientRegistration(patientInfo)

        var patient = await Patient.findByPhoneNumber(patientInfo.phone)
        patient.verified = true
        await patient.save()

        try {
            await handlePatientRegistration(patientInfo)
            throw 'handlePatientRegistration did not throw anything'
        } catch (error) {
            expect(error).toBe(patientRegistrationEnums.ALREADY_REGISTERED_AND_VERIFIED)
        }
    })
})