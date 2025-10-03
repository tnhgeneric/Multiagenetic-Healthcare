package com.agentic.agentic_backend.model;

public class MedicationMapper {
    public static MedicationDTO toDTO(Medication medication) {
        if (medication == null)
            return null;
        MedicationDTO dto = new MedicationDTO();
        dto.setMedicationId(medication.getMedicationId());
        dto.setDrugName(medication.getDrugName());
        dto.setDosage(medication.getDosage());
        dto.setFrequency(medication.getFrequency());
        dto.setPrescribedDate(medication.getPrescribedDate());
        dto.setAdherence(medication.getAdherence());
        // Optionally map diagnosis as needed
        return dto;
    }
}
