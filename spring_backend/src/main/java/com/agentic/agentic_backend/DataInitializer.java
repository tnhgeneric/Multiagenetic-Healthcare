package com.agentic.agentic_backend;

import com.agentic.agentic_backend.model.*;
import com.agentic.agentic_backend.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Collections;

@Component
public class DataInitializer implements CommandLineRunner {
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private HospitalRepository hospitalRepository;
    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private DiagnosisRepository diagnosisRepository;
    @Autowired
    private TreatmentRepository treatmentRepository;
    @Autowired
    private MedicationRepository medicationRepository;
    @Autowired
    private TestRepository testRepository;
    @Autowired
    private AlertRepository alertRepository;

    @Override
    public void run(String... args) throws Exception {
        // Create Doctor
        Doctor doctor = new Doctor();
        doctor.setDoctorId("doc1");
        doctor.setName("Dr. Jane Smith");
        doctor.setSpecialty("General Physician");
        doctor.setContactNumber("1234567890");
        doctor.setQualifications("MBBS, MD");
        doctor.setEmail("jane.smith@example.com");
        doctorRepository.save(doctor);

        // Create Hospital
        Hospital hospital = new Hospital();
        hospital.setHospitalId("hosp1");
        hospital.setName("City General Hospital");
        hospital.setLocation("Colombo");
        hospital.setContactNumber("011-1234567");
        hospital.setType("General");
        hospitalRepository.save(hospital);

        // Create Diagnosis
        Diagnosis diagnosis = new Diagnosis();
        diagnosis.setDiagnosisId("diag1");
        diagnosis.setName("Hypertension");
        diagnosis.setDescription("High blood pressure");
        diagnosis.setDiagnosedDate("2024-01-15");
        diagnosisRepository.save(diagnosis);

        // Create Treatment
        Treatment treatment = new Treatment();
        treatment.setTreatmentId("treat1");
        treatment.setName("Hypertension Management");
        treatment.setStartDate("2024-01-21");
        treatment.setEndDate("2024-06-21");
        treatment.setStatus("Ongoing");
        treatmentRepository.save(treatment);

        // Create Medication
        Medication medication = new Medication();
        medication.setMedicationId("med1");
        medication.setDrugName("Lisinopril");
        medication.setDosage("10mg");
        medication.setFrequency("Once daily");
        medication.setPrescribedDate("2024-01-20");
        medication.setAdherence("Compliant");
        medication.setDiagnosis(diagnosis);
        medicationRepository.save(medication);

        // Create Appointment
        Appointment appointment = new Appointment();
        appointment.setAppointmentId("appt1");
        appointment.setDate("2024-01-20");
        appointment.setType("Consultation");
        appointment.setStatus("Completed");
        appointment.setDoctor(doctor);
        appointment.setHospital(hospital);
        appointment.setDiagnoses(Collections.singletonList(diagnosis));
        appointmentRepository.save(appointment);

        // Create Test
        Test test = new Test();
        test.setTestId("test1");
        test.setName("Blood Pressure Test");
        test.setResult("140/90");
        test.setDate("2024-01-20");
        test.setStatus("Completed");
        testRepository.save(test);

        // Create Alert
        Alert alert = new Alert();
        alert.setAlertId("alert1");
        alert.setMessage("Patient missed medication dose");
        alert.setType("MissedMedication");
        alert.setTimestamp("2024-01-22T09:00:00Z");
        alert.setResolved(false);
        alert.setDoctor(doctor);
        alertRepository.save(alert);

        // Relationship entities for Patient
        HasDiagnosis hasDiagnosis = new HasDiagnosis();
        hasDiagnosis.setDiagnosedDate("2024-01-15");
        hasDiagnosis.setDiagnosis(diagnosis);

        ReceivesTreatment receivesTreatment = new ReceivesTreatment();
        receivesTreatment.setStartDate("2024-01-21");
        receivesTreatment.setEndDate("2024-06-21");
        receivesTreatment.setTreatment(treatment);

        TakesMedication takesMedication = new TakesMedication();
        takesMedication.setPrescribedDate("2024-01-20");
        takesMedication.setAdherence("Compliant");
        takesMedication.setMedication(medication);

        HasAppointment hasAppointment = new HasAppointment();
        hasAppointment.setAppointmentDate("2024-01-20");
        hasAppointment.setAppointmentType("Consultation");
        hasAppointment.setStatus("Completed");
        hasAppointment.setAppointment(appointment);

        UnderwentTest underwentTest = new UnderwentTest();
        underwentTest.setPerformedDate("2024-01-20");
        underwentTest.setTest(test);

        AdmittedTo admittedTo = new AdmittedTo();
        admittedTo.setAdmissionDate("2024-01-19");
        admittedTo.setDischargeDate("2024-01-21");
        admittedTo.setHospital(hospital);

        CaredForBy caredForBy = new CaredForBy();
        caredForBy.setStartDate("2024-01-15");
        caredForBy.setDoctor(doctor);

        // Create Patient with relationship entities
        Patient patient = new Patient();
        patient.setPatientId("pat1");
        patient.setName("John Doe");
        patient.setDob("1980-05-10");
        patient.setGender("Male");
        patient.setContactNumber("077-1234567");
        patient.setAddress("123 Main St, Colombo");
        patient.setBloodGroup("A+");
        patient.setInsuranceProvider("Ceylinco");
        patient.setCurrentStatus("Active");
        patient.setHasDiagnoses(Collections.singletonList(hasDiagnosis));
        patient.setReceivesTreatments(Collections.singletonList(receivesTreatment));
        patient.setTakesMedications(Collections.singletonList(takesMedication));
        patient.setHasAppointments(Collections.singletonList(hasAppointment));
        patient.setUnderwentTests(Collections.singletonList(underwentTest));
        patient.setAdmittedTos(Collections.singletonList(admittedTo));
        patient.setCaredForBys(Collections.singletonList(caredForBy));
        patientRepository.save(patient);

        // Link Alert to Patient after patient is saved
        alert.setPatient(patient);
        alertRepository.save(alert);

        // Relationship entities for Doctor
        PracticesAt practicesAt = new PracticesAt();
        practicesAt.setStartDate("2024-01-01");
        practicesAt.setHospital(hospital);

        Performed performed = new Performed();
        performed.setPerformedDate("2024-01-21");
        performed.setTreatment(treatment);

        Ordered ordered = new Ordered();
        ordered.setOrderedDate("2024-01-20");
        ordered.setTest(test);

        Prescribed prescribed = new Prescribed();
        prescribed.setPrescribedDate("2024-01-20");
        prescribed.setMedication(medication);

        Consulted consulted = new Consulted();
        consulted.setConsultationDate("2024-01-20");
        consulted.setPatient(patient);

        doctor.setPracticesAts(Collections.singletonList(practicesAt));
        doctor.setPerformeds(Collections.singletonList(performed));
        doctor.setOrdereds(Collections.singletonList(ordered));
        doctor.setPrescribeds(Collections.singletonList(prescribed));
        doctor.setConsulteds(Collections.singletonList(consulted));
        doctorRepository.save(doctor);

        // --- Event/Journey Relationships ---
        // Test RESULTED_IN Diagnosis
        ResultedIn resultedIn = new ResultedIn();
        resultedIn.setResultImpact("Confirmed hypertension");
        resultedIn.setDiagnosis(diagnosis);
        test.setResultedIns(Collections.singletonList(resultedIn));
        testRepository.save(test);

        // Diagnosis LEADS_TO Treatment
        LeadsTo leadsTo = new LeadsTo();
        leadsTo.setTreatment(treatment);
        diagnosis.setLeadsTos(Collections.singletonList(leadsTo));
        diagnosisRepository.save(diagnosis);

        // Treatment FOR_DIAGNOSIS
        ForDiagnosis forDiagnosis = new ForDiagnosis();
        forDiagnosis.setDiagnosis(diagnosis);
        treatment.setForDiagnoses(Collections.singletonList(forDiagnosis));

        // Treatment FOR_TREATMENT (for Medication)
        ForTreatment forTreatment = new ForTreatment();
        forTreatment.setTreatment(treatment);
        medication.setForTreatments(Collections.singletonList(forTreatment));
        medicationRepository.save(medication);

        // Appointment FOLLOWS_UP Treatment
        FollowsUp followsUp = new FollowsUp();
        followsUp.setTarget(treatment); // or diagnosis
        appointment.setFollowsUps(Collections.singletonList(followsUp));
        appointmentRepository.save(appointment);

        // Save Treatment with new relationships
        treatmentRepository.save(treatment);

        // Log a message to indicate data initialization is complete
        System.out.println(
                "Sample data initialized: All 9 ontology entities (including Alert) and their property-rich relationships created in Neo4j.");
    }
}
