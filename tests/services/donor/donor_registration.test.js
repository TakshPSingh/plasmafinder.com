const {mongoose} = require('../../../db/mongoose_connect')

const {Donor} = require('../../../models/donor')

const {handleDonorRegistration} = require('../../../services/donor/donor_registration')

const {donorRegistrationEnums} = require('../../../enums/donor_registration')

beforeEach( async () => {
    await Donor.deleteMany()
})

describe('donor registration', () => {
    test('try to register new user with invalid email', async () => {
        var donorInfo = {
            name: 'nhajd',
            age: '22',
            medicallyEligible: true,
            bloodGroup: 'A',
            phone: '+919868711873',
            email: 'adasdsad',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        try {
            await handleDonorRegistration(donorInfo)
            throw 'handleDonorRegistration did not throw anything'
        } catch (error) {
            expect(error).toBe(donorRegistrationEnums.VALIDATION_ERROR)
        }
    })

    test('try to register new user with invalid phone', async () => {
        var donorInfo = {
            name: 'nhajd',
            age: '22',
            medicallyEligible: true,
            bloodGroup: 'A',
            phone: '+11873',
            email: 'abcdefgh@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        try {
            await handleDonorRegistration(donorInfo)
            throw 'handleDonorRegistration did not throw anything'
        } catch (error) {
            expect(error).toBe(donorRegistrationEnums.VALIDATION_ERROR)
        }
    })

    test('try to register new user with valid info', async () => {
        var donorInfo = {
            name: 'nhajd',
            age: '22',
            medicallyEligible: true,
            bloodGroup: 'A',
            phone: '+919868711873',
            email: 'abcdefgh@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        try {
            await handleDonorRegistration(donorInfo)
            expect(true).toBe(true)
        } catch (error) {
            expect(true).toBe(false)
        }
    })

    test('try to register with already registered but not verified user', async () => {
        var donorInfo = {
            name: 'nhajd',
            age: '22',
            medicallyEligible: true,
            bloodGroup: 'A',
            phone: '+919868711873',
            email: 'abcdefgh@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }

        await handleDonorRegistration(donorInfo)

        try {
            await handleDonorRegistration(donorInfo)
            throw 'handleDonorRegistration did not throw anything'
        } catch (error) {
            expect(error).toBe(donorRegistrationEnums.ALREADY_REGISTERED_BUT_PENDING_VERIFICATION)
        }
    })

    test('try to register with already registered and verified user', async () => {
        var donorInfo = {
            name: 'nhajd',
            age: '22',
            medicallyEligible: true,
            bloodGroup: 'A',
            phone: '+919868711873',
            email: 'abcdefgh@gmail.com',
            location: {
                latitude: 0,
                longitude: 0
            }
        }
        await handleDonorRegistration(donorInfo)

        var donor = await Donor.findByPhoneNumber(donorInfo.phone)
        donor.verified = true
        await donor.save()

        try {
            await handleDonorRegistration(donorInfo)
            throw 'handleDonorRegistration did not throw anything'
        } catch (error) {
            expect(error).toBe(donorRegistrationEnums.ALREADY_REGISTERED_AND_VERIFIED)
        }
    })
})