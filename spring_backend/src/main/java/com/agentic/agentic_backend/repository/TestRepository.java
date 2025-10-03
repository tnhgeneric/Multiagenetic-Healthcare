package com.agentic.agentic_backend.repository;

import com.agentic.agentic_backend.model.Test;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface TestRepository extends Neo4jRepository<Test, String> {
}
