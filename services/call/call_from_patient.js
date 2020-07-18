const {Donor} = require('../../models/donor')
const {Patient} = require('../../models/patient')

const fetchDonorPhoneNumber = async (donorId) => {
    var donor = await Donor.findById(donorId)
    return donor.phone
}

export const handleCallRequestFromPatient = async (patientPhone) => {
    var patient = await Patient.findByPhoneNumber(patientPhone)

    if (patient && patient.callsLeft) {
        patient.callsLeft--
        await patient.save()
        return fetchDonorPhoneNumber(patient.donorId)
    }
}