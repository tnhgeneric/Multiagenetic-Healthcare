package com.agentic.agentic_backend.model;

import java.util.List;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

@Node
public class Medication {
    @Id
    private String medicationId;
    private String drugName;
    private String dosage;
    private String frequency;
    private String prescribedDate;
    private String adherence;

    @Relationship(type = "FOR_DIAGNOSIS")
    private Diagnosis diagnosis;

    @Relationship(type = "FOR_TREATMENT")
    private List<ForTreatment> forTreatments;

    // getters and setters
    public String getMedicationId() {
        return medicationId;
    }

    public void setMedicationId(String medicationId) {
        this.medicationId = medicationId;
    }

    public String getDrugName() {
        return drugName;
    }

    public void setDrugName(String drugName) {
        this.drugName = drugName;
    }

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getPrescribedDate() {
        return prescribedDate;
    }

    public void setPrescribedDate(String prescribedDate) {
        this.prescribedDate = prescribedDate;
    }

    public String getAdherence() {
        return adherence;
    }

    public void setAdherence(String adherence) {
        this.adherence = adherence;
    }

    public Diagnosis getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(Diagnosis diagnosis) {
        this.diagnosis = diagnosis;
    }

    public List<ForTreatment> getForTreatments() {
        return forTreatments;
    }

    public void setForTreatments(List<ForTreatment> forTreatments) {
        this.forTreatments = forTreatments;
    }
}
