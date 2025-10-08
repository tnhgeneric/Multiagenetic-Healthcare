package com.agentic.agentic_backend.repository;

import com.agentic.agentic_backend.model.Appointment;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface AppointmentRepository extends Neo4jRepository<Appointment, String> {
}
