const {Donor} = require('../../models/donor')

const {distanceInKmBetweenCoordinates} = require('./distance_calculator')

const {patientMatchingEnums} = require('../../enums/patient_matching')

const {DONATION_RANGE_IN_KILOMETERS} = require('../../constants/donation')
const {COMPATIBLE_BLOOD_GROUPS_FOR_PATIENT} = require('../../constants/plasma_compatibility')
const {MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_PATIENT, MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_DONOR} = require('../../constants/calls')

const {notifyPatientAndDonorOfMatch, notifyPatientOfUnsuccessfulMatch} = require('../sms/notifications/match')

const findDonorsWithCompatibleBloodGroup = (patient, availableDonors) => {
    var donorsWithCompatibleBloodGroup = []
    var patientBloodGroup = patient.bloodGroup

    availableDonors.forEach((donor) => {
        var donorBloodGroup = donor.bloodGroup
        if (COMPATIBLE_BLOOD_GROUPS_FOR_PATIENT[patientBloodGroup].includes(donorBloodGroup)) {
            donorsWithCompatibleBloodGroup.push(donor)
        }
    })
    return donorsWithCompatibleBloodGroup
}

const calculateDistanceBetweenPatientAndDonor = (patient, donor) => {
    var patientLocation = patient.location
    var donorLocation = donor.location

    return distanceInKmBetweenCoordinates(patientLocation.latitude, patientLocation.longitude, donorLocation.latitude, donorLocation.longitude)
}

const findAvailableDonorsWithinRangeOfPatient = (patient, availableDonors) => {
    var filteredDonorObjects = []
    availableDonors.forEach((donor) => {
        var distanceBetweenPatientAndDonor = calculateDistanceBetweenPatientAndDonor(patient, donor)
        if (distanceBetweenPatientAndDonor <= DONATION_RANGE_IN_KILOMETERS) {
            filteredDonorObjects.push({ donor, distanceBetweenPatientAndDonor })
        }
    })
    return filteredDonorObjects
}

const shouldReplaceOptimalDonor = (donorObject, optimalDonor, optimalDonorDistance, optimalDonorNumberOfTimesDonated) => {
    var donor = donorObject.donor
    var distanceBetweenDonorAndPatient = donorObject.distanceBetweenPatientAndDonor
    
    var firstDonorInArray = optimalDonor === undefined 
    var donatedFewerTimesThanCurrentOptimal = optimalDonor && donor.numberOfTimesDonated < optimalDonorNumberOfTimesDonated
    var donatedEqualNumberOfTimesAsCurrentOptimalButLocatedCloser = optimalDonor && donor.numberOfTimesDonated === optimalDonorNumberOfTimesDonated
    && distanceBetweenDonorAndPatient < optimalDonorDistance

    return firstDonorInArray || donatedFewerTimesThanCurrentOptimal || donatedEqualNumberOfTimesAsCurrentOptimalButLocatedCloser
}

const findOptimalDonorForPatient = (donorObjects) => {
    var optimalDonor, optimalDonorDistance, optimalDonorNumberOfTimesDonated

    for (var index = 0; index < donorObjects.length; index++) {
        var donorObject = donorObjects[index]
        if (shouldReplaceOptimalDonor(donorObject, optimalDonor, optimalDonorDistance, optimalDonorNumberOfTimesDonated)) {
            var donor = donorObject.donor
            
            optimalDonor = donor
            optimalDonorDistance = donorObject.distanceBetweenPatientAndDonor
            optimalDonorNumberOfTimesDonated = donor.numberOfTimesDonated
        }
    }
    return optimalDonor
}

export const matchPatientWithDonor = async (patient) => {
    var availableDonors = await Donor.findAvailableAndVerfiedDonors()
    var availableDonorsWithCompatibleBloodGroup = findDonorsWithCompatibleBloodGroup(patient, availableDonors)    
    var availableDonorObjectsWithinRangeOfPatient = findAvailableDonorsWithinRangeOfPatient(patient, availableDonorsWithCompatibleBloodGroup)

    var optimalDonor = findOptimalDonorForPatient(availableDonorObjectsWithinRangeOfPatient)
    if (!optimalDonor) {
        throw patientMatchingEnums.NO_DONOR_AVAILABLE
    } else {
        patient.donorId = optimalDonor._id
        optimalDonor.patientId = patient._id

        patient.callsLeft = MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_PATIENT
        optimalDonor.callsLeft = MAX_NUMBER_OF_CALLS_ALLOWED_PER_DONATION_BY_DONOR

        optimalDonor.available = false

        await patient.save()
        await optimalDonor.save()
        
        return {
            patient,
            assignedDonor: optimalDonor
        }
    }
}

export const handleDonorMatching = async (patient) => {
    try {
        var {patient, assignedDonor}  = await matchPatientWithDonor(patient)
        await notifyPatientAndDonorOfMatch(patient.phone, assignedDonor.phone)
    } catch (error) {
        if (error === patientMatchingEnums.NO_DONOR_AVAILABLE) {
            await notifyPatientOfUnsuccessfulMatch(patient.phone)
        }
    }
}