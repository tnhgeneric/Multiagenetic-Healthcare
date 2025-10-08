package com.agentic.agentic_backend.repository;

import com.agentic.agentic_backend.model.Hospital;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface HospitalRepository extends Neo4jRepository<Hospital, String> {
}
