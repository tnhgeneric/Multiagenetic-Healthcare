package com.agentic.agentic_backend.model;

public class PatientMapper {
    public static PatientDTO toDTO(Patient patient) {
        if (patient == null)
            return null;
        PatientDTO dto = new PatientDTO();
        dto.setPatientId(patient.getPatientId());
        dto.setName(patient.getName());
        dto.setDob(patient.getDob());
        dto.setGender(patient.getGender());
        // Add more fields as needed
        return dto;
    }
}
