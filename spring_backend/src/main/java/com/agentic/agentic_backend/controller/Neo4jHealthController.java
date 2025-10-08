package com.agentic.agentic_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.neo4j.driver.Result;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
public class Neo4jHealthController {

    @Autowired
    private Driver neo4jDriver;

    @GetMapping("/api/neo4j/health")
    public String checkNeo4jConnection() {
        try (Session session = neo4jDriver.session()) {
            Result result = session.run("RETURN 1 AS result");
            if (result.hasNext()) {
                return "Neo4j connection OK.";
            } else {
                return "Neo4j connection failed (no result).";
            }
        } catch (Exception e) {
            return "Neo4j connection failed: " + e.getMessage();
        }
    }
}
