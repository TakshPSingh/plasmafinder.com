const mongoose = require('mongoose')
const validator = require('validator')

const {MOBILE_LOCALES} = require('../constants/phone')

const {donorEnums} = require('../enums/donor')

const UnverifiedDonorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 65
    },
    phone: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isMobilePhone(value, MOBILE_LOCALES)) {
                throw donorEnums.INVALID_PHONE_NUMBER
            }
        }
    },
    email: {
        type: String,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw donorEnums.INVALID_EMAIL
            }
        }
    },
    location: {
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: +90
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: +180
        }
    },
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    },
    otp: {
        type: Number,
        min: 0,
        max: 999999
    }
})

UnverifiedDonor.statics.create = async function (donor) {
    var UnverifiedDonor = this

    var potentialDonor = new UnverifiedDonor(donor)
    return potentialDonor.save()
}

export const UnverifiedDonor = mongoose.model('UnverifiedDonor', UnverifiedDonorSchema)