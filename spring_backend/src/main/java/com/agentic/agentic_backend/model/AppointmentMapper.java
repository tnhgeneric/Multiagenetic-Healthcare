package com.agentic.agentic_backend.model;

public class AppointmentMapper {
    public static AppointmentDTO toDTO(Appointment appointment) {
        if (appointment == null)
            return null;
        AppointmentDTO dto = new AppointmentDTO();
        dto.setAppointmentId(appointment.getAppointmentId());
        dto.setDate(appointment.getDate());
        dto.setType(appointment.getType());
        dto.setStatus(appointment.getStatus());
        // Optionally map doctor, hospital, diagnosis, test info as needed
        return dto;
    }
}
