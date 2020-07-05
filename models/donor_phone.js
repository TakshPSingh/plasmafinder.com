const mongoose = require('mongoose')
const validator = require('validator')

const {MOBILE_LOCALES} = require('../constants/phone')

const {donorEnums} = require('../enums/donor')

const DonorPhoneSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isMobilePhone(value, MOBILE_LOCALES)) {
                throw donorEnums.INVALID_PHONE_NUMBER
            }
        }
    },
    numberOfTimesOTPSent: {
        type: Number,
        default: 0,
        required: true
    },
    verfied: {
        type: Boolean,
        required: true,
        default: false
    }
})

export const DonorPhone = mongoose.model('DonorPhone', DonorPhoneSchema)