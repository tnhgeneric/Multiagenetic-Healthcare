package com.agentic.agentic_backend.model;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;
import java.util.List;

/**
 * # Ontology Entities and Microservices Architecture Documentation
 *
 * ## Ontology Entities
 *
 * In this project, the following classes are considered **ontology entities**:
 * - Patient
 * - Doctor
 * - Hospital
 * - Appointment
 * - Diagnosis
 * - Treatment
 * - Medication
 * - Test
 *
 * These entities represent real-world healthcare concepts and are modeled as
 * nodes in the Neo4j graph database. Each entity is annotated with `@Node` and
 * may have relationships to other entities, reflecting the semantic structure
 * of the healthcare domain. This approach enables advanced queries and
 * reasoning about patient journeys, diagnoses, treatments, and more.
 *
 * ### Example: Patient Entity
 * ```java
 * 
 * @Node
 *       public class Patient {
 * @Id
 *     private String patientId;
 *     private String name;
 *     private String dob;
 *     private String gender;
 *     // ...other fields...
 * @Relationship(type = "HAS_APPOINTMENT")
 *                    private List<Appointment> appointments;
 * @Relationship(type = "HAS_DIAGNOSIS")
 *                    private List<Diagnosis> diagnoses;
 *                    // ...
 *                    }
 *                    ```
 *
 *                    ## Microservices Architecture and Design Patterns
 *
 *                    - The backend is structured as a Spring Boot microservice,
 *                    following microservices architecture principles.
 *                    - Each major domain concept is modeled as a separate
 *                    entity, supporting domain-driven design.
 *                    - Repository interfaces are created for each entity,
 *                    following the repository pattern for clean separation of
 *                    data access logic.
 *                    - Security is managed centrally using Spring Security,
 *                    with public and protected endpoints.
 *                    - The project is organized using NX monorepo best
 *                    practices, with all backend code under
 *                    `apps/agentic-backend/` and shared code in `libs/` (if
 *                    needed).
 *
 *                    ## Summary of Work Completed
 *                    - Scaffolded all core ontology entities as Java classes
 *                    with Neo4j annotations and relationships.
 *                    - Created repository interfaces for each entity.
 *                    - Configured Neo4j Aura connectivity and verified with a
 *                    health check endpoint.
 *                    - Implemented Spring Security configuration for endpoint
 *                    protection.
 *                    - Documented the difference between ontology entities
 *                    (semantic, graph-based, domain-driven) and normal entities
 *                    (simple data models).
 *                    - Ensured the codebase follows microservices and
 *                    domain-driven design patterns for scalability and
 *                    maintainability.
 *
 *                    ---
 *
 *                    This documentation provides a clear overview for beginners
 *                    and contributors on the structure, purpose, and best
 *                    practices used in this healthcare Agentic AI project.
 */
@Node
public class Patient {
    @Id
    private String patientId;
    private String name;
    private String dob;
    private String gender;
    private String contactNumber;
    private String address;
    private String bloodGroup;
    private String insuranceProvider;
    private String currentStatus;

    @Relationship(type = "HAS_DIAGNOSIS")
    private List<HasDiagnosis> hasDiagnoses;

    @Relationship(type = "RECEIVES_TREATMENT")
    private List<ReceivesTreatment> receivesTreatments;

    @Relationship(type = "TAKES_MEDICATION")
    private List<TakesMedication> takesMedications;

    @Relationship(type = "HAS_APPOINTMENT")
    private List<HasAppointment> hasAppointments;

    @Relationship(type = "UNDERWENT_TEST")
    private List<UnderwentTest> underwentTests;

    @Relationship(type = "ADMITTED_TO")
    private List<AdmittedTo> admittedTos;

    @Relationship(type = "CARED_FOR_BY")
    private List<CaredForBy> caredForBys;

    // getters and setters
    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getInsuranceProvider() {
        return insuranceProvider;
    }

    public void setInsuranceProvider(String insuranceProvider) {
        this.insuranceProvider = insuranceProvider;
    }

    public String getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(String currentStatus) {
        this.currentStatus = currentStatus;
    }

    public List<HasDiagnosis> getHasDiagnoses() {
        return hasDiagnoses;
    }

    public void setHasDiagnoses(List<HasDiagnosis> hasDiagnoses) {
        this.hasDiagnoses = hasDiagnoses;
    }

    public List<ReceivesTreatment> getReceivesTreatments() {
        return receivesTreatments;
    }

    public void setReceivesTreatments(List<ReceivesTreatment> receivesTreatments) {
        this.receivesTreatments = receivesTreatments;
    }

    public List<TakesMedication> getTakesMedications() {
        return takesMedications;
    }

    public void setTakesMedications(List<TakesMedication> takesMedications) {
        this.takesMedications = takesMedications;
    }

    public List<HasAppointment> getHasAppointments() {
        return hasAppointments;
    }

    public void setHasAppointments(List<HasAppointment> hasAppointments) {
        this.hasAppointments = hasAppointments;
    }

    public List<UnderwentTest> getUnderwentTests() {
        return underwentTests;
    }

    public void setUnderwentTests(List<UnderwentTest> underwentTests) {
        this.underwentTests = underwentTests;
    }

    public List<AdmittedTo> getAdmittedTos() {
        return admittedTos;
    }

    public void setAdmittedTos(List<AdmittedTo> admittedTos) {
        this.admittedTos = admittedTos;
    }

    public List<CaredForBy> getCaredForBys() {
        return caredForBys;
    }

    public void setCaredForBys(List<CaredForBy> caredForBys) {
        this.caredForBys = caredForBys;
    }
}
