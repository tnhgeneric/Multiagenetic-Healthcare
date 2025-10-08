package com.agentic.agentic_backend.model;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class ResultedIn {
    @Id
    @GeneratedValue
    private Long id;
    private String resultImpact;
    @TargetNode
    private Diagnosis diagnosis;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getResultImpact() {
        return resultImpact;
    }

    public void setResultImpact(String resultImpact) {
        this.resultImpact = resultImpact;
    }

    public Diagnosis getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(Diagnosis diagnosis) {
        this.diagnosis = diagnosis;
    }
}
