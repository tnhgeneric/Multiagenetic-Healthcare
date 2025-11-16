import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  FlatList,
  TextInput,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { patientsStyles, colors, spacing, modalStyles } from './styles/doctor.styles';
import {
  PatientBasic,
  PatientDetailForDoctor,
  PatientFilters,
  defaultPatientFilters,
} from '../../types/doctor';
import { firestoreService } from '../../services/firestoreService';

/**
 * DoctorPatients.tsx
 * 
 * Component for managing doctor's patients:
 * - List all patients
 * - Search patients in real-time
 * - Sort patients
 * - View patient details
 * - Access patient medical history
 * - View upcoming appointments
 */

interface Props {
  doctorId: string;
  onRefresh?: () => void;
}

interface ComponentState {
  patients: any[];
  filteredPatients: any[];
  searchTerm: string;
  filters: PatientFilters;
  selectedPatient: any;
  showDetailModal: boolean;
  loading: boolean;
  refreshing: boolean;
  searching: boolean;
  error: string | null;
}

const DoctorPatients: React.FC<Props> = ({ doctorId, onRefresh }) => {
  const [state, setState] = useState<ComponentState>({
    patients: [],
    filteredPatients: [],
    searchTerm: '',
    filters: defaultPatientFilters,
    selectedPatient: null,
    showDetailModal: false,
    loading: true,
    refreshing: false,
    searching: false,
    error: null,
  });

  /**
   * Load all patients
   */
  const loadPatients = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      const patients = await firestoreService.getDoctorPatients(doctorId);

      // Apply filters
      const filtered = applyFilters(patients, state.filters, state.searchTerm);

      setState((prev) => ({
        ...prev,
        patients,
        filteredPatients: filtered,
        loading: false,
        refreshing: false,
      }));
    } catch (error: any) {
      console.error('Error loading patients:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to load patients',
        loading: false,
        refreshing: false,
      }));
    }
  }, [doctorId, state.filters, state.searchTerm]);

  /**
   * Apply filters and search to patients
   */
  const applyFilters = (
    patients: any[],
    filters: PatientFilters,
    searchTerm: string,
  ): any[] => {
    let filtered = [...patients];

    // Search by name, email, or phone
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (patient) => {
          const name = `${patient.firstName} ${patient.lastName}`.toLowerCase();
          const email = (patient.email || '').toLowerCase();
          const phone = (patient.phone || '').toLowerCase();
          return (
            name.includes(term) ||
            email.includes(term) ||
            phone.includes(term)
          );
        },
      );
    }

    // Sort
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let compareValue = 0;

        if (filters.sortBy === 'name') {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          compareValue = nameA.localeCompare(nameB);
        }

        return filters.sortOrder === 'desc' ? -compareValue : compareValue;
      });
    }

    // Apply limit and offset
    if (filters.limit) {
      filtered = filtered.slice(filters.offset || 0, (filters.offset || 0) + filters.limit);
    }

    return filtered;
  };

  /**
   * Load patient detail
   */
  const loadPatientDetail = useCallback(
    async (patientId: string) => {
      try {
        setState((prev) => ({ ...prev, searching: true }));

        // Get basic patient info
        const patient = state.patients.find((p) => p.patientId === patientId);
        if (!patient) return;

        // Get detailed patient info
        const detail = await firestoreService.getPatientDetailsForDoctor(patientId);

        setState((prev) => ({
          ...prev,
          selectedPatient: detail,
          showDetailModal: true,
          searching: false,
        }));
      } catch (error: any) {
        console.error('Error loading patient details:', error);
        Alert.alert('Error', 'Failed to load patient details');
        setState((prev) => ({ ...prev, searching: false }));
      }
    },
    [state.patients],
  );

  /**
   * Initial load
   */
  useEffect(() => {
    loadPatients();
  }, []);

  /**
   * Handle search
   */
  const handleSearch = (text: string) => {
    setState((prev) => {
      const filtered = applyFilters(prev.patients, prev.filters, text);
      return {
        ...prev,
        searchTerm: text,
        filteredPatients: filtered,
      };
    });
  };

  /**
   * Handle filter change
   */
  const handleFilterChange = (newFilters: Partial<PatientFilters>) => {
    const updated = { ...state.filters, ...newFilters };
    setState((prev) => ({
      ...prev,
      filters: updated,
      filteredPatients: applyFilters(prev.patients, updated, prev.searchTerm),
    }));
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    setState((prev) => ({ ...prev, refreshing: true }));
    loadPatients();
    if (onRefresh) onRefresh();
  };

  const {
    filteredPatients,
    filters,
    selectedPatient,
    showDetailModal,
    loading,
    refreshing,
    searching,
    error,
    searchTerm,
  } = state;

  // Loading state
  if (loading) {
    return (
      <View style={patientsStyles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={patientsStyles.loadingText}>Loading patients...</Text>
      </View>
    );
  }

  return (
    <View style={patientsStyles.container}>
      {/* Error Message */}
      {error && (
        <View style={patientsStyles.errorContainer}>
          <Text style={patientsStyles.errorText}>{error}</Text>
        </View>
      )}

      {/* Search Container */}
      <View style={patientsStyles.searchContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.lightGray,
            borderRadius: 8,
            paddingHorizontal: spacing.md,
          }}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={colors.darkSecondary}
          />
          <TextInput
            style={[patientsStyles.searchInput, { paddingHorizontal: spacing.sm, flex: 1 }]}
            placeholder="Search by name, email, or phone..."
            placeholderTextColor={colors.darkSecondary}
            value={searchTerm}
            onChangeText={handleSearch}
          />
          {searchTerm && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={colors.darkSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort Options */}
        <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              color: colors.dark,
            }}
          >
            Sort by:
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {(['name', 'lastVisit', 'nextAppointment'] as const).map((sortBy) => (
              <TouchableOpacity
                key={sortBy}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: 20,
                  backgroundColor:
                    filters.sortBy === sortBy ? colors.primary : colors.lightGray,
                  borderWidth: 1,
                  borderColor:
                    filters.sortBy === sortBy ? colors.primary : colors.border,
                }}
                onPress={() => handleFilterChange({ sortBy })}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color:
                      filters.sortBy === sortBy ? colors.white : colors.dark,
                    fontWeight: '500',
                  }}
                >
                  {sortBy === 'name'
                    ? 'Name'
                    : sortBy === 'lastVisit'
                      ? 'Last Visit'
                      : 'Next Apt'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <View style={patientsStyles.centerContainer}>
          <MaterialCommunityIcons
            name="account-multiple-outline"
            size={48}
            color={colors.darkSecondary}
          />
          <Text style={patientsStyles.emptyText}>
            {searchTerm ? 'No patients found' : 'No patients yet'}
          </Text>
          <Text style={patientsStyles.emptySubtext}>
            {searchTerm ? 'Try a different search' : 'Your patient list will appear here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.patientId}
          renderItem={({ item: patient }) => {
            const initials = patient.name
              .split(' ')
              .map((n: string) => n.charAt(0))
              .join('')
              .toUpperCase();

            return (
              <TouchableOpacity
                style={patientsStyles.patientCard}
                onPress={() => loadPatientDetail(patient.patientId)}
              >
                {/* Patient Avatar */}
                <View style={patientsStyles.patientAvatar}>
                  <Text style={patientsStyles.patientAvatarText}>{initials}</Text>
                </View>

                {/* Patient Information */}
                <View style={patientsStyles.patientInfo}>
                  <Text style={patientsStyles.patientName}>{patient.name}</Text>
                  <Text style={patientsStyles.patientEmail}>{patient.email}</Text>

                  {/* Last Visit */}
                  {patient.lastVisitDate && (
                    <Text style={patientsStyles.patientLastVisit}>
                      Last visit: {new Date(patient.lastVisitDate).toLocaleDateString()}
                    </Text>
                  )}

                  {/* Next Appointment */}
                  {patient.nextAppointmentDate && (
                    <Text
                      style={[
                        patientsStyles.patientLastVisit,
                        { color: colors.primary, marginTop: spacing.xs },
                      ]}
                    >
                      Next: {new Date(patient.nextAppointmentDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={patientsStyles.patientActionButton}
                  onPress={() => loadPatientDetail(patient.patientId)}
                  disabled={searching}
                >
                  {searching ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={colors.white}
                    />
                  )}
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
          }}
          scrollEnabled={false}
        />
      )}

      {/* Patient Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setState((prev) => ({ ...prev, showDetailModal: false }))}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            {/* Modal Header */}
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>Patient Details</Text>
              <TouchableOpacity
                style={modalStyles.closeButton}
                onPress={() => setState((prev) => ({ ...prev, showDetailModal: false }))}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.dark}
                />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            {selectedPatient && (
              <ScrollView>
                <View style={modalStyles.modalContent}>
                  {/* Patient Header */}
                  <View
                    style={{
                      backgroundColor: colors.primaryLight,
                      padding: spacing.lg,
                      borderRadius: 12,
                      marginBottom: spacing.lg,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: colors.dark,
                        marginBottom: spacing.sm,
                      }}
                    >
                      {selectedPatient.name}
                    </Text>
                    <View style={{ gap: spacing.sm }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                        <MaterialCommunityIcons
                          name="email"
                          size={16}
                          color={colors.primary}
                        />
                        <Text style={{ color: colors.dark }}>{selectedPatient.email}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                        <MaterialCommunityIcons
                          name="phone"
                          size={16}
                          color={colors.primary}
                        />
                        <Text style={{ color: colors.dark }}>{selectedPatient.phone}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                        <MaterialCommunityIcons
                          name="cake"
                          size={16}
                          color={colors.primary}
                        />
                        <Text style={{ color: colors.dark }}>
                          DOB: {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Basic Information */}
                  <View
                    style={{
                      backgroundColor: colors.white,
                      padding: spacing.md,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                      marginBottom: spacing.lg,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: colors.dark,
                        marginBottom: spacing.md,
                      }}
                    >
                      Basic Information
                    </Text>
                    <View style={{ gap: spacing.md }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          paddingBottom: spacing.md,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        }}
                      >
                        <Text style={{ color: colors.darkSecondary }}>Gender:</Text>
                        <Text
                          style={{
                            fontWeight: '600',
                            color: colors.dark,
                            textTransform: 'capitalize',
                          }}
                        >
                          {selectedPatient.gender}
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          paddingBottom: spacing.md,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        }}
                      >
                        <Text style={{ color: colors.darkSecondary }}>Last Visit:</Text>
                        <Text style={{ fontWeight: '600', color: colors.dark }}>
                          {selectedPatient.lastVisitDate
                            ? new Date(selectedPatient.lastVisitDate).toLocaleDateString()
                            : 'N/A'}
                        </Text>
                      </View>

                      {selectedPatient.nextAppointmentDate && (
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Text style={{ color: colors.darkSecondary }}>Next Appointment:</Text>
                          <Text style={{ fontWeight: '600', color: colors.primary }}>
                            {new Date(selectedPatient.nextAppointmentDate).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Medical Summary */}
                  {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                    <View
                      style={{
                        backgroundColor: '#FFE0B2',
                        padding: spacing.md,
                        borderRadius: 8,
                        marginBottom: spacing.lg,
                        borderLeftWidth: 4,
                        borderLeftColor: colors.warning,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: colors.dark,
                          marginBottom: spacing.md,
                        }}
                      >
                        ⚠️ Allergies
                      </Text>
                      {selectedPatient?.allergies?.map((allergy: any, idx: number) => (
                        <Text key={idx} style={{ color: colors.dark, marginBottom: spacing.xs }}>
                          • {allergy}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* Current Medications */}
                  {selectedPatient.currentMedications &&
                    selectedPatient.currentMedications.length > 0 && (
                      <View style={{ marginBottom: spacing.lg }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: colors.dark,
                            marginBottom: spacing.md,
                          }}
                        >
                          Current Medications
                        </Text>
                        {selectedPatient?.currentMedications?.map((med: any, idx: number) => (
                          <View
                            key={idx}
                            style={{
                              backgroundColor: colors.white,
                              padding: spacing.md,
                              borderRadius: 8,
                              borderWidth: 1,
                              borderColor: colors.border,
                              marginBottom: spacing.md,
                            }}
                          >
                            <Text
                              style={{
                                fontWeight: '600',
                                color: colors.dark,
                                marginBottom: spacing.xs,
                              }}
                            >
                              {med.name}
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.darkSecondary }}>
                              {med.dosage} • {med.frequency}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                  {/* Medical History */}
                  {selectedPatient.medicalHistory && selectedPatient.medicalHistory.length > 0 && (
                    <View style={{ marginBottom: spacing.lg }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: colors.dark,
                          marginBottom: spacing.md,
                        }}
                      >
                        Medical History
                      </Text>
                      {selectedPatient?.medicalHistory?.slice(0, 3).map((history: any, idx: number) => (
                        <View
                          key={idx}
                          style={{
                            backgroundColor: colors.white,
                            padding: spacing.md,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: colors.border,
                            marginBottom: spacing.md,
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: '600',
                              color: colors.dark,
                              marginBottom: spacing.xs,
                            }}
                          >
                            {history.title}
                          </Text>
                          <Text style={{ fontSize: 12, color: colors.darkSecondary }}>
                            {new Date(history.date).toLocaleDateString()} • {history.doctor}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Close Button */}
                  <TouchableOpacity
                    style={[modalStyles.modalButton, modalStyles.modalButtonSecondary]}
                    onPress={() => setState((prev) => ({ ...prev, showDetailModal: false }))}
                  >
                    <Text
                      style={[
                        modalStyles.modalButtonText,
                        modalStyles.modalButtonTextSecondary,
                      ]}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DoctorPatients;
