package com.agentic.agentic_backend.repository;

import com.agentic.agentic_backend.model.Alert;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface AlertRepository extends Neo4jRepository<Alert, String> {
}
