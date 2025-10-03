package com.agentic.agentic_backend.repository;

import com.agentic.agentic_backend.model.Doctor;
import org.springframework.data.neo4j.repository.Neo4jRepository;

public interface DoctorRepository extends Neo4jRepository<Doctor, String> {
}
