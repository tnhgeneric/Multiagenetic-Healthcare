package com.agentic.agentic_backend.model;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;
import java.util.List;

@Node
public class Appointment {
    @Id
    private String appointmentId;
    private String date;
    private String type;
    private String status;

    @Relationship(type = "WITH_DOCTOR")
    private Doctor doctor;

    @Relationship(type = "AT_HOSPITAL")
    private Hospital hospital;

    @Relationship(type = "HAS_DIAGNOSIS")
    private List<Diagnosis> diagnoses;

    @Relationship(type = "HAS_TEST")
    private List<Test> tests;

    @Relationship(type = "FOLLOWS_UP")
    private List<FollowsUp> followsUps;

    // getters and setters
    public String getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Hospital getHospital() {
        return hospital;
    }

    public void setHospital(Hospital hospital) {
        this.hospital = hospital;
    }

    public java.util.List<Diagnosis> getDiagnoses() {
        return diagnoses;
    }

    public void setDiagnoses(java.util.List<Diagnosis> diagnoses) {
        this.diagnoses = diagnoses;
    }

    public java.util.List<Test> getTests() {
        return tests;
    }

    public void setTests(java.util.List<Test> tests) {
        this.tests = tests;
    }

    public java.util.List<FollowsUp> getFollowsUps() {
        return followsUps;
    }

    public void setFollowsUps(java.util.List<FollowsUp> followsUps) {
        this.followsUps = followsUps;
    }
}
