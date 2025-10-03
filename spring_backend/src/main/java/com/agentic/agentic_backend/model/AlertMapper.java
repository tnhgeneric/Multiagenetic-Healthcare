package com.agentic.agentic_backend.model;

public class AlertMapper {
    public static AlertDTO toDTO(Alert alert) {
        if (alert == null)
            return null;
        AlertDTO dto = new AlertDTO();
        dto.setAlertId(alert.getAlertId());
        dto.setMessage(alert.getMessage());
        dto.setType(alert.getType());
        dto.setTimestamp(alert.getTimestamp());
        dto.setResolved(alert.isResolved());
        // Optionally map patient/doctor as needed
        return dto;
    }
}
