package com.agentic.agentic_backend.model;

public class HospitalMapper {
    public static HospitalDTO toDTO(Hospital hospital) {
        if (hospital == null)
            return null;
        HospitalDTO dto = new HospitalDTO();
        dto.setHospitalId(hospital.getHospitalId());
        dto.setName(hospital.getName());
        dto.setLocation(hospital.getLocation());
        dto.setContactNumber(hospital.getContactNumber());
        dto.setType(hospital.getType());
        // Add more fields as needed
        return dto;
    }
}
