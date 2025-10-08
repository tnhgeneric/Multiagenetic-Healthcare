package com.agentic.agentic_backend.model;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;
import java.util.List;

@Node
public class Diagnosis {
    @Id
    private String diagnosisId;
    private String name;
    private String description;
    private String diagnosedDate;

    @Relationship(type = "LEADS_TO")
    private List<LeadsTo> leadsTos;

    // getters and setters
    public String getDiagnosisId() {
        return diagnosisId;
    }

    public void setDiagnosisId(String diagnosisId) {
        this.diagnosisId = diagnosisId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDiagnosedDate() {
        return diagnosedDate;
    }

    public void setDiagnosedDate(String diagnosedDate) {
        this.diagnosedDate = diagnosedDate;
    }

    public java.util.List<LeadsTo> getLeadsTos() {
        return leadsTos;
    }

    public void setLeadsTos(java.util.List<LeadsTo> leadsTos) {
        this.leadsTos = leadsTos;
    }
}
