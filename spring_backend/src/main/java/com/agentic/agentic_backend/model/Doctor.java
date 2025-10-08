package com.agentic.agentic_backend.model;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.List;

@Node
public class Doctor {
    @Id
    private String doctorId;
    private String name;
    private String specialty;
    private String contactNumber;
    private String qualifications;
    private String email;

    @Relationship(type = "PRACTICES_AT")
    private List<PracticesAt> practicesAts;

    @Relationship(type = "PERFORMED")
    private List<Performed> performeds;

    @Relationship(type = "ORDERED")
    private List<Ordered> ordereds;

    @Relationship(type = "PRESCRIBED")
    private List<Prescribed> prescribeds;

    @Relationship(type = "CONSULTED")
    private List<Consulted> consulteds;

    // getters and setters
    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getQualifications() {
        return qualifications;
    }

    public void setQualifications(String qualifications) {
        this.qualifications = qualifications;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<PracticesAt> getPracticesAts() {
        return practicesAts;
    }

    public void setPracticesAts(List<PracticesAt> practicesAts) {
        this.practicesAts = practicesAts;
    }

    public List<Performed> getPerformeds() {
        return performeds;
    }

    public void setPerformeds(List<Performed> performeds) {
        this.performeds = performeds;
    }

    public List<Ordered> getOrdereds() {
        return ordereds;
    }

    public void setOrdereds(List<Ordered> ordereds) {
        this.ordereds = ordereds;
    }

    public List<Prescribed> getPrescribeds() {
        return prescribeds;
    }

    public void setPrescribeds(List<Prescribed> prescribeds) {
        this.prescribeds = prescribeds;
    }

    public List<Consulted> getConsulteds() {
        return consulteds;
    }

    public void setConsulteds(List<Consulted> consulteds) {
        this.consulteds = consulteds;
    }
}
