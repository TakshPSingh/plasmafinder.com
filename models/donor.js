const mongoose = require('mongoose')
const validator = require('validator')

const {MOBILE_LOCALES} = require('../constants/phone')

const {donorEnums} = require('../enums/donor')

const DonorSchema = new mongoose.Schema({
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
    medicallyEligible: {
        type: Boolean,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
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
    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    numberOfTimesOTPSent: {
        type: Number,
        required: true,
        default: 0
    },
    otp: {
        type: Number,
        min: 0,
        max: 999999
    },
    verificationAttemptedWithCurrentOTP: {
        type: Boolean
    }
},
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

DonorSchema.statics.findByPhoneNumber = function (phone) {
    var Donor = this
    return Donor.findOne({ phone })
}

export const Donor = mongoose.model('Donor', DonorSchema)