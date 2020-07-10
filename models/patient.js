const mongoose = require('mongoose')
const validator = require('validator')

const {MOBILE_LOCALES} = require('../constants/phone')

const {patientEnums} = require('../enums/patient')

const PatientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    bloodGroup: {
        type: String,
        required: true,
        enum: ['A','B','AB','O']
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
    },
    donorId: {
        type: mongoose.Types.ObjectId
    },
    callsLeft: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    }
},
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
)

PatientSchema.statics.findByPhoneNumber = function (phone) {
    var Patient = this
    return Patient.findOne({ phone })
}

export const Patient = mongoose.model('Patient', PatientSchema)