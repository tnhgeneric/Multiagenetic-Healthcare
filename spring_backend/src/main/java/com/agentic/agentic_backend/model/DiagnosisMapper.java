package com.agentic.agentic_backend.model;

public class DiagnosisMapper {
    public static DiagnosisDTO toDTO(Diagnosis diagnosis) {
        if (diagnosis == null)
            return null;
        DiagnosisDTO dto = new DiagnosisDTO();
        dto.setDiagnosisId(diagnosis.getDiagnosisId());
        dto.setName(diagnosis.getName());
        dto.setDescription(diagnosis.getDescription());
        dto.setDiagnosedDate(diagnosis.getDiagnosedDate());
        // Optionally map treatments as needed
        return dto;
    }
}
