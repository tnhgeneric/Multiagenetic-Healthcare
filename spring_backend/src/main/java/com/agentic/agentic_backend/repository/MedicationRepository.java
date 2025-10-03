package com.agentic.agentic_backend.repository;

import com.agentic.agentic_backend.model.Medication;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface MedicationRepository extends Neo4jRepository<Medication, String> {
}
