import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// ============================================================================
// PATIENT PROFILE OPERATIONS
// ============================================================================

export interface PatientProfile {
  uid: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email?: string;
  bloodType: string;
  allergies: string;
  chronicConditions: string[];
  insuranceId: string;
  primaryDoctor?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Get patient profile from Firestore
 */
export const getPatientProfile = async (
  patientId: string
): Promise<PatientProfile | null> => {
  try {
    const docRef = doc(db, 'Patient', patientId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as PatientProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return null;
  }
};

/**
 * Update patient profile in Firestore
 */
export const updatePatientProfile = async (
  patientId: string,
  profileData: Partial<PatientProfile>
): Promise<boolean> => {
  try {
    const docRef = doc(db, 'Patient', patientId);
    await updateDoc(docRef, {
      ...profileData,
      updatedAt: Timestamp.now(),
    });
    console.log('Patient profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating patient profile:', error);
    return false;
  }
};

// ============================================================================
// APPOINTMENT OPERATIONS
// ============================================================================

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:MM'
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  type: 'meeting' | 'task';
  createdAt?: Timestamp;
}

/**
 * Get all appointments for a patient on a specific date
 */
export const getPatientAppointmentsByDate = async (
  patientId: string,
  date: string
): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      where('date', '==', date),
      orderBy('time', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data(),
      } as Appointment);
    });
    
    return appointments;
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

/**
 * Get all appointments for a patient (all dates)
 */
export const getPatientAppointments = async (
  patientId: string
): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data(),
      } as Appointment);
    });
    
    return appointments;
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    return [];
  }
};

/**
 * Create a new appointment
 */
export const createAppointment = async (
  appointmentData: Omit<Appointment, 'id' | 'createdAt'>
): Promise<boolean> => {
  try {
    const appointmentRef = doc(collection(db, 'appointments'));
    await setDoc(appointmentRef, {
      ...appointmentData,
      createdAt: Timestamp.now(),
    });
    console.log('Appointment created successfully');
    return true;
  } catch (error) {
    console.error('Error creating appointment:', error);
    return false;
  }
};

// ============================================================================
// MEDICATION OPERATIONS
// ============================================================================

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'inactive';
  prescribedBy: string;
  notes?: string;
  createdAt?: Timestamp;
}

/**
 * Get all medications for a patient
 */
export const getPatientMedications = async (
  patientId: string
): Promise<Medication[]> => {
  try {
    const q = query(
      collection(db, 'medications'),
      where('patientId', '==', patientId),
      orderBy('startDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const medications: Medication[] = [];
    
    querySnapshot.forEach((doc) => {
      medications.push({
        id: doc.id,
        ...doc.data(),
      } as Medication);
    });
    
    return medications;
  } catch (error) {
    console.error('Error fetching medications:', error);
    return [];
  }
};

/**
 * Get active medications for a patient
 */
export const getActiveMedications = async (
  patientId: string
): Promise<Medication[]> => {
  try {
    const q = query(
      collection(db, 'medications'),
      where('patientId', '==', patientId),
      where('status', '==', 'active')
    );
    
    const querySnapshot = await getDocs(q);
    const medications: Medication[] = [];
    
    querySnapshot.forEach((doc) => {
      medications.push({
        id: doc.id,
        ...doc.data(),
      } as Medication);
    });
    
    return medications;
  } catch (error) {
    console.error('Error fetching active medications:', error);
    return [];
  }
};

/**
 * Add a new medication for a patient
 */
export const addMedication = async (
  medicationData: Omit<Medication, 'id' | 'createdAt'>
): Promise<boolean> => {
  try {
    const medicationRef = doc(collection(db, 'medications'));
    await setDoc(medicationRef, {
      ...medicationData,
      createdAt: Timestamp.now(),
    });
    console.log('Medication added successfully');
    return true;
  } catch (error) {
    console.error('Error adding medication:', error);
    return false;
  }
};

// ============================================================================
// LAB REPORT OPERATIONS
// ============================================================================

export interface LabReport {
  id: string;
  patientId: string;
  testName: string;
  date: string;
  results: Record<string, string | number>;
  normalRange: Record<string, string>;
  reportUrl?: string;
  status: 'complete' | 'pending';
  notes?: string;
  createdAt?: Timestamp;
}

/**
 * Get all lab reports for a patient
 */
export const getPatientLabReports = async (
  patientId: string
): Promise<LabReport[]> => {
  try {
    const q = query(
      collection(db, 'labReports'),
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reports: LabReport[] = [];
    
    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data(),
      } as LabReport);
    });
    
    return reports;
  } catch (error) {
    console.error('Error fetching lab reports:', error);
    return [];
  }
};

/**
 * Get recent lab reports (last 5)
 */
export const getRecentLabReports = async (
  patientId: string,
  limit: number = 5
): Promise<LabReport[]> => {
  try {
    const q = query(
      collection(db, 'labReports'),
      where('patientId', '==', patientId),
      where('status', '==', 'complete'),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const reports: LabReport[] = [];
    
    querySnapshot.forEach((doc) => {
      if (reports.length < limit) {
        reports.push({
          id: doc.id,
          ...doc.data(),
        } as LabReport);
      }
    });
    
    return reports;
  } catch (error) {
    console.error('Error fetching recent lab reports:', error);
    return [];
  }
};

/**
 * Get a specific lab report
 */
export const getLabReport = async (
  reportId: string
): Promise<LabReport | null> => {
  try {
    const docRef = doc(db, 'labReports', reportId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as LabReport;
    }
    return null;
  } catch (error) {
    console.error('Error fetching lab report:', error);
    return null;
  }
};

// ============================================================================
// MEDICAL HISTORY OPERATIONS
// ============================================================================

export interface MedicalHistory {
  id: string;
  patientId: string;
  type: 'diagnosis' | 'procedure' | 'hospitalization' | 'surgery';
  title: string;
  date: string;
  description: string;
  doctor?: string;
  hospital?: string;
  notes?: string;
  createdAt?: Timestamp;
}

/**
 * Get patient medical history
 */
export const getPatientMedicalHistory = async (
  patientId: string
): Promise<MedicalHistory[]> => {
  try {
    const q = query(
      collection(db, 'medicalHistory'),
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const history: MedicalHistory[] = [];
    
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data(),
      } as MedicalHistory);
    });
    
    return history;
  } catch (error) {
    console.error('Error fetching medical history:', error);
    return [];
  }
};

// ============================================================================
// TASK/NOTIFICATION OPERATIONS
// ============================================================================

export interface Task {
  id: string;
  patientId: string;
  title: string;
  time: string;
  subtitle?: string;
  type: 'meeting' | 'task';
  avatars?: string[];
  date: string;
  completed?: boolean;
  createdAt?: Timestamp;
}

/**
 * Get tasks for a patient on a specific date
 */
export const getPatientTasks = async (
  patientId: string,
  date: string
): Promise<Task[]> => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('patientId', '==', patientId),
      where('date', '==', date),
      orderBy('time', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      } as Task);
    });
    
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks for date:', error);
    return [];
  }
};

/**
 * Get all tasks for a patient (for calendar view)
 */
export const getAllPatientTasks = async (
  patientId: string
): Promise<Task[]> => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks: Task[] = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      } as Task);
    });
    
    return tasks;
  } catch (error) {
    console.error('Error fetching all tasks:', error);
    return [];
  }
};

/**
 * Mark a task as completed
 */
export const completeTask = async (
  taskId: string
): Promise<boolean> => {
  try {
    const docRef = doc(db, 'tasks', taskId);
    await updateDoc(docRef, {
      completed: true,
      updatedAt: Timestamp.now(),
    });
    console.log('Task marked as completed');
    return true;
  } catch (error) {
    console.error('Error completing task:', error);
    return false;
  }
};

// ============================================================================
// DOCTOR OPERATIONS (for patient's doctor list)
// ============================================================================

export interface DoctorInfo {
  uid: string;
  fullName: string;
  specialization: string;
  phone: string;
  email: string;
  hospital?: string;
  bio?: string;
  rating?: number;
  avatarUrl?: string;
}

/**
 * Get doctor information
 */
export const getDoctorInfo = async (
  doctorId: string
): Promise<DoctorInfo | null> => {
  try {
    const docRef = doc(db, 'Doctor', doctorId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as DoctorInfo;
    }
    return null;
  } catch (error) {
    console.error('Error fetching doctor info:', error);
    return null;
  }
};

/**
 * Search doctors by specialization
 */
export const searchDoctorsBySpecialization = async (
  specialization: string
): Promise<DoctorInfo[]> => {
  try {
    const q = query(
      collection(db, 'Doctor'),
      where('specialization', '==', specialization)
    );
    
    const querySnapshot = await getDocs(q);
    const doctors: DoctorInfo[] = [];
    
    querySnapshot.forEach((doc) => {
      doctors.push({
        uid: doc.id,
        ...doc.data(),
      } as DoctorInfo);
    });
    
    return doctors;
  } catch (error) {
    console.error('Error searching doctors:', error);
    return [];
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user has Firestore profile (Doctor or Patient)
 */
export const getUserProfile = async (
  uid: string
): Promise<{ type: 'doctor' | 'patient' | null; data: any }> => {
  try {
    // Check Doctor collection
    const doctorRef = doc(db, 'Doctor', uid);
    const doctorSnap = await getDoc(doctorRef);
    if (doctorSnap.exists()) {
      return { type: 'doctor', data: doctorSnap.data() };
    }
    
    // Check Patient collection
    const patientRef = doc(db, 'Patient', uid);
    const patientSnap = await getDoc(patientRef);
    if (patientSnap.exists()) {
      return { type: 'patient', data: patientSnap.data() };
    }
    
    return { type: null, data: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { type: null, data: null };
  }
};

/**
 * Create a new patient profile
 */
export const createPatientProfile = async (
  patientId: string,
  profileData: Partial<PatientProfile>
): Promise<boolean> => {
  try {
    const docRef = doc(db, 'Patient', patientId);
    await setDoc(docRef, {
      uid: patientId,
      ...profileData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('Patient profile created');
    return true;
  } catch (error) {
    console.error('Error creating patient profile:', error);
    return false;
  }
};

// ============================================================================
// DOCTOR PROFILE OPERATIONS (Phase 4)
// ============================================================================

export interface Doctor {
  uid: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  profileImage?: string;
  bio?: string;
  hospitalAffiliation?: string;
  officeAddress?: string;
  rating?: number;
  reviewCount?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * Get doctor profile from Firestore
 */
export const getDoctorProfile = async (doctorId: string): Promise<Doctor | null> => {
  try {
    const docRef = doc(db, 'Doctor', doctorId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Doctor;
    }
    return null;
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return null;
  }
};

/**
 * Update doctor profile in Firestore
 */
export const updateDoctorProfile = async (
  doctorId: string,
  profileData: Partial<Doctor>
): Promise<boolean> => {
  try {
    const docRef = doc(db, 'Doctor', doctorId);
    await updateDoc(docRef, {
      ...profileData,
      updatedAt: Timestamp.now(),
    });
    console.log('Doctor profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    return false;
  }
};

/**
 * Get all appointments for a doctor
 */
export const getDoctorAppointments = async (
  doctorId: string
): Promise<Appointment[]> => {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const appointments: Appointment[] = [];
    querySnapshot.forEach((doc) => {
      appointments.push({
        ...doc.data() as Appointment,
        id: doc.id,
      });
    });
    
    return appointments;
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    return [];
  }
};

/**
 * Get appointments for a doctor on a specific date
 */
export const getDoctorAppointmentsByDate = async (
  doctorId: string,
  date: Date
): Promise<Appointment[]> => {
  try {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      where('date', '==', dateStr),
      orderBy('time', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    
    querySnapshot.forEach((doc) => {
      appointments.push({
        ...doc.data() as Appointment,
        id: doc.id,
      });
    });
    
    return appointments;
  } catch (error) {
    console.error('Error fetching doctor appointments by date:', error);
    return [];
  }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
): Promise<boolean> => {
  try {
    const docRef = doc(db, 'appointments', appointmentId);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });
    console.log('Appointment status updated');
    return true;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return false;
  }
};

/**
 * Get all patients for a doctor
 */
export const getDoctorPatients = async (doctorId: string): Promise<PatientProfile[]> => {
  try {
    // Get all appointments for this doctor
    const appointmentsQ = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId)
    );
    
    const appointmentsSnapshot = await getDocs(appointmentsQ);
    const patientIds = new Set<string>();
    
    appointmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.patientId) {
        patientIds.add(data.patientId);
      }
    });
    
    // Fetch patient profiles
    const patients: PatientProfile[] = [];
    
    for (const patientId of patientIds) {
      const patient = await getPatientProfile(patientId);
      if (patient) {
        patients.push(patient);
      }
    }
    
    return patients;
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    return [];
  }
};

/**
 * Search patients for a doctor
 */
export const searchDoctorPatients = async (
  doctorId: string,
  searchTerm: string
): Promise<PatientProfile[]> => {
  try {
    const patients = await getDoctorPatients(doctorId);
    
    if (!searchTerm.trim()) {
      return patients;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return patients.filter((patient) => {
      return (
        patient.fullName.toLowerCase().includes(lowerSearchTerm) ||
        patient.email?.toLowerCase().includes(lowerSearchTerm) ||
        patient.phone?.includes(searchTerm)
      );
    });
  } catch (error) {
    console.error('Error searching doctor patients:', error);
    return [];
  }
};

/**
 * Get patient details with medical history for a doctor
 */
export const getPatientDetailsForDoctor = async (patientId: string): Promise<any> => {
  try {
    const profile = await getPatientProfile(patientId);
    if (!profile) {
      return null;
    }
    
    // Get medical history
    const historyQ = query(
      collection(db, 'medicalHistory'),
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    const historySnapshot = await getDocs(historyQ);
    const medicalHistory: any[] = [];
    historySnapshot.forEach((doc) => {
      medicalHistory.push(doc.data());
    });
    
    // Get medications
    const medicationsQ = query(
      collection(db, 'medications'),
      where('patientId', '==', patientId)
    );
    const medicationsSnapshot = await getDocs(medicationsQ);
    const medications: any[] = [];
    medicationsSnapshot.forEach((doc) => {
      medications.push(doc.data());
    });
    
    // Get lab reports
    const labQ = query(
      collection(db, 'labReports'),
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );
    const labSnapshot = await getDocs(labQ);
    let lastLabReport = null;
    if (!labSnapshot.empty) {
      lastLabReport = labSnapshot.docs[0].data();
    }
    
    return {
      profile,
      medicalHistory,
      medications,
      lastLabReport,
    };
  } catch (error) {
    console.error('Error fetching patient details for doctor:', error);
    return null;
  }
};

/**
 * Get patient medical summary
 */
export const getPatientMedicalSummary = async (
  patientId: string
): Promise<{
  chronicDiseases: string[];
  allergies: string[];
  currentMedications: string[];
  lastVisit?: string;
} | null> => {
  try {
    const profile = await getPatientProfile(patientId);
    if (!profile) {
      return null;
    }
    
    const medicationsQ = query(
      collection(db, 'medications'),
      where('patientId', '==', patientId)
    );
    const medicationsSnapshot = await getDocs(medicationsQ);
    const currentMedications: string[] = [];
    
    medicationsSnapshot.forEach((doc) => {
      const med = doc.data();
      if (med.isActive) {
        currentMedications.push(med.name);
      }
    });
    
    return {
      chronicDiseases: profile.chronicConditions || [],
      allergies: profile.allergies ? [profile.allergies] : [],
      currentMedications,
    };
  } catch (error) {
    console.error('Error fetching patient medical summary:', error);
    return null;
  }
};

// ============================================================================
// FIRESTORE SERVICE WRAPPER OBJECT
// ============================================================================
// For convenient usage: import { firestoreService } from './firestoreService'

export const firestoreService = {
  // Patient operations
  getPatientProfile,
  updatePatientProfile,
  createPatientProfile,
  getTasksByPatientId,
  createTask,
  updateTask,
  deleteTask,
  getNotificationsByPatientId,
  createNotification,
  deleteNotification,
  
  // Appointment operations
  getAppointmentsByPatientId,
  getAppointmentsByDoctorName,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  
  // Lab reports
  getLabReportsByPatientId,
  createLabReport,
  
  // Medications
  getMedicationsByPatientId,
  createMedication,
  updateMedication,
  
  // Medical history
  getMedicalHistoryByPatientId,
  createMedicalHistory,
  
  // User operations
  getUserProfile,
  
  // Doctor operations (Phase 4)
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAppointments,
  getDoctorAppointmentsByDate,
  updateAppointmentStatus,
  getDoctorPatients,
  searchDoctorPatients,
  getPatientDetailsForDoctor,
  getPatientMedicalSummary,
};
