/**
 * Phase 4: Doctor Dashboard - TypeScript Interfaces
 * 
 * Defines all doctor-specific data structures for the doctor dashboard.
 * Extends the existing patient interfaces to include doctor-centric views.
 */

// ============ DOCTOR DATA ============

/**
 * Doctor profile information
 */
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
  officeHours?: OfficeHours;
  rating?: number;
  reviewCount?: number;
  createdAt?: Date | any;
  updatedAt?: Date | any;
}

/**
 * Doctor's office hours
 */
export interface OfficeHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

/**
 * Single day schedule
 */
export interface DaySchedule {
  isOpen: boolean;
  startTime?: string; // HH:MM
  endTime?: string;   // HH:MM
  breakStart?: string;
  breakEnd?: string;
}

/**
 * Doctor statistics
 */
export interface DoctorStats {
  totalPatients: number;
  appointmentsToday: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  averageRating: number;
  totalReviews: number;
}

// ============ APPOINTMENT DATA (Doctor View) ============

/**
 * Appointment with patient details (for doctor dashboard)
 * Maps to firestoreService.Appointment
 */
export interface AppointmentWithPatient {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:MM'
  status: AppointmentStatus;
  notes: string;
  type: 'meeting' | 'task';
  createdAt?: any;
}

/**
 * Appointment status
 */
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

/**
 * Appointment with detailed patient medical info
 */
export interface AppointmentDetail extends AppointmentWithPatient {
  medicalHistory?: MedicalHistory[];
  currentMedications?: Medication[];
  allergies?: string[];
  previousDiagnosis?: string[];
}

// ============ PATIENT DATA (Doctor View) ============

/**
 * Basic patient information (for lists)
 * Maps to firestoreService.PatientProfile (simplified)
 */
export interface PatientBasic {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  profileImage?: string;
  phone?: string;
}

/**
 * Patient with medical summary (for doctor dashboard)
 */
export interface PatientWithSummary extends PatientBasic {
  medicalHistory: MedicalHistory[];
  currentMedications: Medication[];
  allergies: string[];
  chronicDiseases?: string[];
  lastLabReport?: LabReport;
  riskFactors?: string[];
}

/**
 * Detailed patient information for doctor
 */
export interface PatientDetailForDoctor extends PatientWithSummary {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insuranceDetails?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  appointments: AppointmentWithPatient[];
  medicalDocuments?: string[]; // URLs
}

/**
 * Patient search result
 */
export interface PatientSearchResult {
  patientId: string;
  name: string;
  email: string;
  phone: string;
  lastVisitDate?: Date;
  nextAppointmentDate?: Date;
  matchScore: number; // 0-1, for relevance ranking
}

// ============ MEDICAL DATA (from Phase 3 - reused) ============

/**
 * Medical history record
 */
export interface MedicalHistory {
  historyId: string;
  patientId: string;
  date: Date;
  title: string;
  description: string;
  doctor: string;
  hospital: string;
  diagnosis?: string;
  treatment?: string;
  outcome?: string;
}

/**
 * Medication information
 */
export interface Medication {
  medicationId: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  prescribedBy: string;
  reason: string;
  sideEffects?: string[];
  isActive: boolean;
}

/**
 * Lab report
 */
export interface LabReport {
  reportId: string;
  patientId: string;
  date: Date;
  testName: string;
  results: Record<string, number | string>;
  referenceRanges?: Record<string, string>;
  labName: string;
  normalcy: 'normal' | 'abnormal' | 'critical';
  notes?: string;
}

// ============ FILTER & SORT TYPES ============

/**
 * Appointment filter options
 */
export interface AppointmentFilters {
  status?: AppointmentStatus | 'all';
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  patientId?: string;
  sortBy?: 'date' | 'patient' | 'status' | 'reason';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Patient filter & search options
 */
export interface PatientFilters {
  searchTerm?: string;
  sortBy?: 'name' | 'lastVisit' | 'nextAppointment';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// ============ UI STATE TYPES ============

/**
 * Doctor dashboard view state
 */
export interface DoctorDashboardState {
  doctorProfile: Doctor | null;
  statistics: DoctorStats | null;
  todayAppointments: AppointmentWithPatient[];
  upcomingAppointments: AppointmentWithPatient[];
  patientsList: PatientBasic[];
  loading: boolean;
  error: string | null;
  activeTab: 'appointments' | 'patients' | 'profile';
}

/**
 * Appointments tab state
 */
export interface AppointmentsTabState {
  appointments: AppointmentWithPatient[];
  filters: AppointmentFilters;
  selectedAppointment: AppointmentDetail | null;
  loading: boolean;
  error: string | null;
  showDetailModal: boolean;
}

/**
 * Patients tab state
 */
export interface PatientsTabState {
  patients: PatientBasic[];
  searchTerm: string;
  filters: PatientFilters;
  selectedPatient: PatientDetailForDoctor | null;
  loading: boolean;
  error: string | null;
  showDetailModal: boolean;
  searchResults: PatientSearchResult[];
}

/**
 * Profile tab state
 */
export interface ProfileTabState {
  profile: Doctor | null;
  isEditing: boolean;
  formData: Partial<Doctor>;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

// ============ API RESPONSE TYPES ============

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============ NOTIFICATION TYPES ============

/**
 * Appointment notification for doctor
 */
export interface AppointmentNotification {
  notificationId: string;
  doctorId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  type: 'new-appointment' | 'appointment-reminder' | 'patient-cancelled' | 'patient-rescheduled';
  message: string;
  scheduledDate?: Date;
  read: boolean;
  createdAt: Date;
}

/**
 * Message notification for doctor
 */
export interface MessageNotification {
  notificationId: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  message: string;
  messagePreview: string;
  read: boolean;
  createdAt: Date;
}

// ============ EXPORT DEFAULTS ============

/**
 * Default empty doctor profile
 */
export const defaultDoctorProfile: Doctor = {
  uid: '',
  name: '',
  email: '',
  phone: '',
  specialization: '',
  licenseNumber: '',
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Default empty doctor stats
 */
export const defaultDoctorStats: DoctorStats = {
  totalPatients: 0,
  appointmentsToday: 0,
  pendingAppointments: 0,
  completedAppointments: 0,
  cancelledAppointments: 0,
  averageRating: 0,
  totalReviews: 0,
};

/**
 * Default appointment filters
 */
export const defaultAppointmentFilters: AppointmentFilters = {
  status: 'all',
  sortBy: 'date',
  sortOrder: 'asc',
};

/**
 * Default patient filters
 */
export const defaultPatientFilters: PatientFilters = {
  searchTerm: '',
  sortBy: 'name',
  sortOrder: 'asc',
  limit: 20,
  offset: 0,
};
