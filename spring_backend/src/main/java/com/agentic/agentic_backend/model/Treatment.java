package com.agentic.agentic_backend.model;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;
import java.util.List;

@Node
public class Treatment {
    @Id
    private String treatmentId;
    private String name;
    private String startDate;
    private String endDate;
    private String status;

    @Relationship(type = "INVOLVES_MEDICATION")
    private List<Medication> medications;

    @Relationship(type = "FOR_DIAGNOSIS")
    private List<ForDiagnosis> forDiagnoses;

    @Relationship(type = "FOR_TREATMENT")
    private List<ForTreatment> forTreatments;

    // getters and setters
    public String getTreatmentId() {
        return treatmentId;
    }

    public void setTreatmentId(String treatmentId) {
        this.treatmentId = treatmentId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public java.util.List<Medication> getMedications() {
        return medications;
    }

    public void setMedications(java.util.List<Medication> medications) {
        this.medications = medications;
    }

    public java.util.List<ForDiagnosis> getForDiagnoses() {
        return forDiagnoses;
    }

    public void setForDiagnoses(java.util.List<ForDiagnosis> forDiagnoses) {
        this.forDiagnoses = forDiagnoses;
    }

    public java.util.List<ForTreatment> getForTreatments() {
        return forTreatments;
    }

    public void setForTreatments(java.util.List<ForTreatment> forTreatments) {
        this.forTreatments = forTreatments;
    }
}
