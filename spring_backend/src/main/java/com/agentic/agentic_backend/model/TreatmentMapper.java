package com.agentic.agentic_backend.model;

public class TreatmentMapper {
    public static TreatmentDTO toDTO(Treatment treatment) {
        if (treatment == null)
            return null;
        TreatmentDTO dto = new TreatmentDTO();
        dto.setTreatmentId(treatment.getTreatmentId());
        dto.setName(treatment.getName());
        dto.setStartDate(treatment.getStartDate());
        dto.setEndDate(treatment.getEndDate());
        dto.setStatus(treatment.getStatus());
        // Optionally map medications as needed
        return dto;
    }
}
