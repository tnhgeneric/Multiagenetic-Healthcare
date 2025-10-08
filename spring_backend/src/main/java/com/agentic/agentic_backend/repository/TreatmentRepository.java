package com.agentic.agentic_backend.repository;

import com.agentic.agentic_backend.model.Treatment;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface TreatmentRepository extends Neo4jRepository<Treatment, String> {
}
