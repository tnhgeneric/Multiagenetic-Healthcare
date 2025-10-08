package com.agentic.agentic_backend.repository;

import com.agentic.agentic_backend.model.Diagnosis;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface DiagnosisRepository extends Neo4jRepository<Diagnosis, String> {
}
