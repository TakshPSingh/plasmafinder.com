const {mongoose} = require('../../../db/mongoose_connect')

const {Donor} = require('../../../models/donor')
const {Patient} = require('../../../models/patient')

const {handleDonorRegistration} = require('../../../services/donor/donor_registration')
const {handlePatientRegistration} = require('../../../services/patient/patient_registration')
const {verifyDonor} = require('../../../services/donor/donor_verification')
const {verifyPatient} = require('../../../services/patient/patient_verification')
const {matchPatientWithDonor} = require('../../../services/donation/match_patient_with_donor')

const {donorRegistrationEnums} = require('../../../enums/donor_registration')
const {patientVerificationEnums} = require('../../../enums/patient_verification')
const {patientMatchingEnums} = require('../../../enums/patient_matching')
const {donorEnums} = require('../../../enums/donor')

const PATIENT_PHONE_NUMBER = '+919868711873'
const DONOR_PHONE_NUMBER = '+919910166009'
const DONOR_TWO_PHONE_NUMBER = '+919716610606'

beforeEach( async () => {
    await Donor.deleteMany()
    await Patient.deleteMany()
})

describe('match patient with donor', () => {
    jest.setTimeout(15000)

    test('no donors in the database', async () => {
        var patientInfo = {
            name: 'Patient',
            age: '22',
            bloodGroup: 'A',
            phone: PATIENT_PHONE_NUMBER,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }
        await handlePatientRegistration(patientInfo)

        var patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)
        await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp)

        try {
            await matchPatientWithDonor(patient)
            throw 'matchPatientWithDonor did not throw anything'
        } catch (error) {
            expect(error).toBe(patientMatchingEnums.NO_DONOR_AVAILABLE)
        }
    })

    test('no available donors in the database', async () => {
        var donorInfo = {
            name: 'Donor',
            age: '22',
            bloodGroup: 'A',
            phone: DONOR_PHONE_NUMBER,
            medicallyEligible: true,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        await handleDonorRegistration(donorInfo)
        var donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)
        await verifyDonor(DONOR_PHONE_NUMBER, donor.otp)
        donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)
        donor.available = false
        await donor.save()

        var patientInfo = {
            name: 'Patient',
            age: '22',
            bloodGroup: 'A',
            phone: PATIENT_PHONE_NUMBER,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }
        await handlePatientRegistration(patientInfo)

        var patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)
        await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp)

        try {
            await matchPatientWithDonor(patient)
            throw 'matchPatientWithDonor did not throw anything'
        } catch (error) {
            expect(error).toBe(patientMatchingEnums.NO_DONOR_AVAILABLE)
        }
    })

    test('no donor with compatiable blood group', async () => {
        var donorInfo = {
            name: 'Donor',
            age: '22',
            bloodGroup: 'O',
            phone: DONOR_PHONE_NUMBER,
            medicallyEligible: true,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        await handleDonorRegistration(donorInfo)
        var donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)
        await verifyDonor(DONOR_PHONE_NUMBER, donor.otp)

        var patientInfo = {
            name: 'Patient',
            age: '22',
            bloodGroup: 'A',
            phone: PATIENT_PHONE_NUMBER,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }
        await handlePatientRegistration(patientInfo)

        var patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)
        await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp)

        try {
            await matchPatientWithDonor(patient)
            throw 'matchPatientWithDonor did not throw anything'
        } catch (error) {
            expect(error).toBe(patientMatchingEnums.NO_DONOR_AVAILABLE)
        }
    })

    test('no donor within range of patient', async () => {
        var donorInfo = {
            name: 'Donor',
            age: '22',
            bloodGroup: 'A',
            phone: DONOR_PHONE_NUMBER,
            medicallyEligible: true,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        await handleDonorRegistration(donorInfo)
        var donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)
        await verifyDonor(DONOR_PHONE_NUMBER, donor.otp)

        var patientInfo = {
            name: 'Patient',
            age: '22',
            bloodGroup: 'A',
            phone: PATIENT_PHONE_NUMBER,
            email: 'abcd@gmail.com',
            location: {
                latitude: 80,
                longitude: 175
            }
        }
        await handlePatientRegistration(patientInfo)

        var patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)
        await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp)

        try {
            await matchPatientWithDonor(patient)
            throw 'matchPatientWithDonor did not throw anything'
        } catch (error) {
            expect(error).toBe(patientMatchingEnums.NO_DONOR_AVAILABLE)
        }
    })

    test('just one compatible donor', async () => {
        var donorInfo = {
            name: 'Donor',
            age: '22',
            bloodGroup: 'A',
            phone: DONOR_PHONE_NUMBER,
            medicallyEligible: true,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        await handleDonorRegistration(donorInfo)
        var donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)
        await verifyDonor(DONOR_PHONE_NUMBER, donor.otp)

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

        var {patient, assignedDonor} = await matchPatientWithDonor(patient)
        
        expect(patient.phone).toBe(PATIENT_PHONE_NUMBER)

        expect(assignedDonor.patientId).toStrictEqual(patient._id)
        expect(patient.donorId).toStrictEqual(assignedDonor._id)
        expect(assignedDonor.available).toBe(false)
    })

    test('Multiple compatible donors - algorithm expected to choose donor by location', async () => {
        var donorInfo = {
            name: 'Donor',
            age: '22',
            bloodGroup: 'A',
            phone: DONOR_PHONE_NUMBER,
            medicallyEligible: true,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0.0001,
            }
        }

        await handleDonorRegistration(donorInfo)
        var donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)
        await verifyDonor(DONOR_PHONE_NUMBER, donor.otp)

        donorInfo = {
            name: 'Donor Two',
            age: '22',
            bloodGroup: 'AB',
            phone: DONOR_TWO_PHONE_NUMBER,
            medicallyEligible: true,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0.0000001,
                longitude: 0
            }
        }

        await handleDonorRegistration(donorInfo)
        donor = await Donor.findByPhoneNumber(DONOR_TWO_PHONE_NUMBER)
        await verifyDonor(DONOR_TWO_PHONE_NUMBER, donor.otp)

        var patientInfo = {
            name: 'Patient',
            age: '22',
            bloodGroup: 'A',
            phone: PATIENT_PHONE_NUMBER,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }
        await handlePatientRegistration(patientInfo)

        var patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)
        await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp)

        var {patient, assignedDonor} = await matchPatientWithDonor(patient)
        
        expect(patient.phone).toBe(PATIENT_PHONE_NUMBER)

        expect(assignedDonor.patientId).toStrictEqual(patient._id)
        expect(patient.donorId).toStrictEqual(assignedDonor._id)
        expect(assignedDonor.available).toBe(false)

        var donorTwo = await Donor.findByPhoneNumber(DONOR_TWO_PHONE_NUMBER)
        expect(assignedDonor._id).toStrictEqual(donorTwo._id)
    })

    test('Multiple compatible donors - algorithm expected to choose donor by numberOfTimesDonated', async () => {
        var donorInfo = {
            name: 'Donor',
            age: '22',
            bloodGroup: 'A',
            phone: DONOR_PHONE_NUMBER,
            medicallyEligible: true,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0.0001,
            }
        }

        await handleDonorRegistration(donorInfo)
        var donor = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)
        await verifyDonor(DONOR_PHONE_NUMBER, donor.otp)

        donorInfo = {
            name: 'Donor Two',
            age: '22',
            bloodGroup: 'AB',
            phone: DONOR_TWO_PHONE_NUMBER,
            medicallyEligible: true,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0.0000001,
                longitude: 0
            }
        }

        await handleDonorRegistration(donorInfo)
        donor = await Donor.findByPhoneNumber(DONOR_TWO_PHONE_NUMBER)
        await verifyDonor(DONOR_TWO_PHONE_NUMBER, donor.otp)

        donor = await Donor.findByPhoneNumber(DONOR_TWO_PHONE_NUMBER)
        donor.numberOfTimesDonated++
        await donor.save()

        var patientInfo = {
            name: 'Patient',
            age: '22',
            bloodGroup: 'A',
            phone: PATIENT_PHONE_NUMBER,
            email: 'abcd@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }
        await handlePatientRegistration(patientInfo)

        var patient = await Patient.findByPhoneNumber(PATIENT_PHONE_NUMBER)
        await verifyPatient(PATIENT_PHONE_NUMBER, patient.otp)

        var {patient, assignedDonor} = await matchPatientWithDonor(patient)
        
        expect(patient.phone).toBe(PATIENT_PHONE_NUMBER)

        expect(assignedDonor.patientId).toStrictEqual(patient._id)
        expect(patient.donorId).toStrictEqual(assignedDonor._id)
        expect(assignedDonor.available).toBe(false)

        var donorOne = await Donor.findByPhoneNumber(DONOR_PHONE_NUMBER)
        expect(assignedDonor._id).toStrictEqual(donorOne._id)
    })
})