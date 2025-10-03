package com.agentic.agentic_backend.repository;

import com.agentic.agentic_backend.model.Patient;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface PatientRepository extends Neo4jRepository<Patient, String> {
}
