const {Donor} = require('../../models/donor')
const {Patient} = require('../../models/patient')

const fetchPatientPhoneNumber = async (patientId) => {
    var patient = await Patient.findById(patientId)
    return patient.phone
}

export const handleCallRequestFromDonor = async (donorPhone) => {
    var donor = await Donor.findByPhoneNumber(donorPhone)

    if (donor && donor.callsLeft) {
        donor.callsLeft--
        await donor.save()
        return fetchPatientPhoneNumber(donor.patientId)
    }
}