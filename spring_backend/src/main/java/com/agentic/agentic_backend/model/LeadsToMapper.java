package com.agentic.agentic_backend.model;

public class LeadsToMapper {
    public static LeadsToDTO toDTO(LeadsTo leadsTo) {
        if (leadsTo == null)
            return null;
        LeadsToDTO dto = new LeadsToDTO();
        dto.setId(leadsTo.getId());
        if (leadsTo.getTreatment() != null) {
            dto.setTreatmentId(leadsTo.getTreatment().getTreatmentId());
            dto.setTreatmentName(leadsTo.getTreatment().getName());
        }
        return dto;
    }
}
