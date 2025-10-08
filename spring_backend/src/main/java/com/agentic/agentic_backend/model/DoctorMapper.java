package com.agentic.agentic_backend.model;

public class DoctorMapper {
    public static DoctorDTO toDTO(Doctor doctor) {
        if (doctor == null)
            return null;
        DoctorDTO dto = new DoctorDTO();
        dto.setDoctorId(doctor.getDoctorId());
        dto.setName(doctor.getName());
        dto.setSpecialty(doctor.getSpecialty());
        dto.setContactNumber(doctor.getContactNumber());
        dto.setQualifications(doctor.getQualifications());
        dto.setEmail(doctor.getEmail());
        // Add more fields as needed
        return dto;
    }
}
