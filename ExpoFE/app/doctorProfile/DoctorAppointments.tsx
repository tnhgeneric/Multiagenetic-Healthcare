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
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { appointmentsStyles, colors, spacing, modalStyles } from './styles/doctor.styles';
import {
  AppointmentWithPatient,
  AppointmentFilters,
  AppointmentDetail,
  AppointmentStatus,
  defaultAppointmentFilters,
} from '../../types/doctor';
import { firestoreService } from '../../services/firestoreService';

/**
 * DoctorAppointments.tsx
 * 
 * Component for managing doctor appointments:
 * - List all appointments
 * - Filter by status and date
 * - Sort appointments
 * - Update appointment status
 * - View appointment details
 * - Quick patient information
 */

interface Props {
  doctorId: string;
  onRefresh?: () => void;
}

interface ComponentState {
  appointments: any[];
  filteredAppointments: any[];
  filters: AppointmentFilters;
  selectedAppointment: any;
  showDetailModal: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  updatingAppointmentId: string | null;
}

const DoctorAppointments: React.FC<Props> = ({ doctorId, onRefresh }) => {
  const [state, setState] = useState<ComponentState>({
    appointments: [],
    filteredAppointments: [],
    filters: defaultAppointmentFilters,
    selectedAppointment: null,
    showDetailModal: false,
    loading: true,
    refreshing: false,
    error: null,
    updatingAppointmentId: null,
  });

  /**
   * Load appointments from Firestore
   */
  const loadAppointments = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      const appointments = await firestoreService.getDoctorAppointments(doctorId);

      // Apply filters
      const filtered = applyFilters(appointments, state.filters);

      setState((prev) => ({
        ...prev,
        appointments,
        filteredAppointments: filtered,
        loading: false,
        refreshing: false,
      }));
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to load appointments',
        loading: false,
        refreshing: false,
      }));
    }
  }, [doctorId, state.filters]);

  /**
   * Apply filters to appointments
   */
  const applyFilters = (
    appointments: any[],
    filters: AppointmentFilters,
  ): any[] => {
    let filtered = [...appointments];

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((apt) => apt.status === filters.status);
    }

    // Filter by date range (optional for now)
    if (filters.dateRange) {
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.date);
        return (
          aptDate >= filters.dateRange!.startDate && aptDate <= filters.dateRange!.endDate
        );
      });
    }

    // Sort
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let compareValue = 0;

        if (filters.sortBy === 'date') {
          compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (filters.sortBy === 'status') {
          compareValue = a.status.localeCompare(b.status);
        }

        return filters.sortOrder === 'desc' ? -compareValue : compareValue;
      });
    }

    return filtered;
  };

  /**
   * Load appointment details
   */
  const loadAppointmentDetail = useCallback(
    async (appointmentId: string) => {
      try {
        // Get the appointment
        const appointment = state.appointments.find((apt) => apt.id === appointmentId);
        if (!appointment) return;

        // For now, just show the appointment details
        setState((prev) => ({
          ...prev,
          selectedAppointment: appointment,
          showDetailModal: true,
        }));
      } catch (error: any) {
        console.error('Error loading appointment details:', error);
        Alert.alert('Error', 'Failed to load appointment details');
      }
    },
    [state.appointments],
  );

  /**
   * Update appointment status
   */
  const updateAppointmentStatus = useCallback(
    async (appointmentId: string, newStatus: AppointmentStatus) => {
      try {
        setState((prev) => ({ ...prev, updatingAppointmentId: appointmentId }));

        await firestoreService.updateAppointmentStatus(appointmentId, newStatus);

        // Update local state
        setState((prev) => {
          const updated = prev.appointments.map((apt) =>
            apt.id === appointmentId ? { ...apt, status: newStatus } : apt,
          );
          return {
            ...prev,
            appointments: updated,
            filteredAppointments: applyFilters(updated, prev.filters),
            updatingAppointmentId: null,
            selectedAppointment: prev.selectedAppointment
              ? { ...prev.selectedAppointment, status: newStatus }
              : null,
          };
        });

        Alert.alert('Success', `Appointment marked as ${newStatus}`);
      } catch (error: any) {
        console.error('Error updating appointment:', error);
        Alert.alert('Error', 'Failed to update appointment status');
        setState((prev) => ({ ...prev, updatingAppointmentId: null }));
      }
    },
    [doctorId],
  );

  /**
   * Initial load
   */
  useEffect(() => {
    loadAppointments();
  }, []);

  /**
   * Handle filter change
   */
  const handleFilterChange = (newFilters: Partial<AppointmentFilters>) => {
    const updated = { ...state.filters, ...newFilters };
    setState((prev) => ({
      ...prev,
      filters: updated,
      filteredAppointments: applyFilters(prev.appointments, updated),
    }));
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    setState((prev) => ({ ...prev, refreshing: true }));
    loadAppointments();
    if (onRefresh) onRefresh();
  };

  const {
    filteredAppointments,
    filters,
    selectedAppointment,
    showDetailModal,
    loading,
    refreshing,
    error,
    updatingAppointmentId,
  } = state;

  // Loading state
  if (loading) {
    return (
      <View style={appointmentsStyles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={appointmentsStyles.loadingText}>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <View style={appointmentsStyles.container}>
      {/* Error Message */}
      {error && (
        <View style={appointmentsStyles.errorContainer}>
          <Text style={appointmentsStyles.errorText}>{error}</Text>
        </View>
      )}

      {/* Filter Bar */}
      <View style={appointmentsStyles.filterContainer}>
        <Text style={appointmentsStyles.filterLabel}>Filter by Status</Text>
        <View style={appointmentsStyles.filterButtons}>
          {(['all', 'scheduled', 'in-progress', 'completed', 'cancelled'] as const).map(
            (status) => (
              <TouchableOpacity
                key={status}
                style={[
                  appointmentsStyles.filterButton,
                  filters.status === status && appointmentsStyles.filterButtonActive,
                ]}
                onPress={() => handleFilterChange({ status: 'scheduled' })}
              >
                <Text
                  style={[
                    appointmentsStyles.filterButtonText,
                    filters.status === status &&
                      appointmentsStyles.filterButtonTextActive,
                  ]}
                >
                  {status === 'all' ? 'All' : status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        <Text style={[appointmentsStyles.filterLabel, { marginTop: spacing.md }]}>
          Sort by
        </Text>
        <View style={appointmentsStyles.filterButtons}>
          {(['date', 'patient', 'status'] as const).map((sortBy) => (
            <TouchableOpacity
              key={sortBy}
              style={[
                appointmentsStyles.filterButton,
                filters.sortBy === sortBy && appointmentsStyles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange({ sortBy })}
            >
              <Text
                style={[
                  appointmentsStyles.filterButtonText,
                  filters.sortBy === sortBy &&
                    appointmentsStyles.filterButtonTextActive,
                ]}
              >
                {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <View style={appointmentsStyles.centerContainer}>
          <MaterialCommunityIcons
            name="calendar-remove"
            size={48}
            color={colors.darkSecondary}
          />
          <Text style={appointmentsStyles.emptyText}>No appointments</Text>
          <Text style={appointmentsStyles.emptySubtext}>
            {filters.status && filters.status !== 'all'
              ? `No ${filters.status} appointments`
              : 'Check back soon'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.appointmentId}
          renderItem={({ item: appointment }) => (
            <TouchableOpacity
              style={appointmentsStyles.appointmentCard}
              onPress={() => loadAppointmentDetail(appointment.appointmentId)}
            >
              {/* Patient Avatar */}
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: colors.primaryLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: colors.primary,
                  }}
                >
                  {appointment.patient.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              {/* Appointment Details */}
              <View style={appointmentsStyles.appointmentCardContent}>
                <Text style={appointmentsStyles.appointmentTime}>
                  {appointment.scheduledTime}
                </Text>
                <Text style={appointmentsStyles.appointmentPatient}>
                  {appointment.patient.name}
                </Text>
                <Text style={appointmentsStyles.appointmentReason}>{appointment.reason}</Text>

                {/* Status Badge */}
                <View
                  style={[
                    appointmentsStyles.appointmentStatusBadge,
                    appointment.status === 'scheduled' &&
                      appointmentsStyles.statusScheduled,
                    appointment.status === 'completed' &&
                      appointmentsStyles.statusCompleted,
                    appointment.status === 'cancelled' &&
                      appointmentsStyles.statusCancelled,
                    appointment.status === 'in-progress' &&
                      appointmentsStyles.statusInProgress,
                  ]}
                >
                  <Text style={appointmentsStyles.appointmentStatusText}>
                    {appointment.status === 'in-progress'
                      ? 'In Progress'
                      : appointment.status.charAt(0).toUpperCase() +
                        appointment.status.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Quick Actions */}
              <View style={appointmentsStyles.appointmentAction}>
                {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                  <TouchableOpacity
                    style={[
                      appointmentsStyles.actionButton,
                      { backgroundColor: colors.success },
                    ]}
                    onPress={() =>
                      updateAppointmentStatus(
                        appointment.appointmentId,
                        appointment.status === 'scheduled' ? 'completed' : 'cancelled',
                      )
                    }
                    disabled={updatingAppointmentId === appointment.appointmentId}
                  >
                    {updatingAppointmentId === appointment.appointmentId ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color={colors.white}
                      />
                    )}
                  </TouchableOpacity>
                )}

                {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                  <TouchableOpacity
                    style={[
                      appointmentsStyles.actionButton,
                      { backgroundColor: colors.danger },
                    ]}
                    onPress={() => {
                      Alert.alert('Cancel Appointment', 'Are you sure?', [
                        { text: 'No' },
                        {
                          text: 'Yes',
                          onPress: () =>
                            updateAppointmentStatus(appointment.appointmentId, 'cancelled'),
                        },
                      ]);
                    }}
                    disabled={updatingAppointmentId === appointment.appointmentId}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={16}
                      color={colors.white}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md }}
          scrollEnabled={false}
        />
      )}

      {/* Detail Modal */}
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
              <Text style={modalStyles.modalTitle}>
                Appointment Details
              </Text>
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
            {selectedAppointment && (
              <ScrollView>
                {/* Patient Information */}
                <View style={modalStyles.modalContent}>
                  <View
                    style={{
                      backgroundColor: colors.primaryLight,
                      padding: spacing.md,
                      borderRadius: 8,
                      marginBottom: spacing.lg,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: colors.dark,
                        marginBottom: spacing.sm,
                      }}
                    >
                      {selectedAppointment.patient.name}
                    </Text>
                    <Text style={{ color: colors.darkSecondary, marginBottom: spacing.xs }}>
                      {selectedAppointment.patient.email}
                    </Text>
                    <Text style={{ color: colors.darkSecondary }}>
                      {selectedAppointment.patient.phone}
                    </Text>
                  </View>

                  {/* Appointment Details */}
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
                      Appointment Information
                    </Text>

                    <View style={{ gap: spacing.md }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: colors.darkSecondary }}>Date & Time:</Text>
                        <Text style={{ fontWeight: '600', color: colors.dark }}>
                          {new Date(selectedAppointment.scheduledDate).toLocaleDateString()} {selectedAppointment.scheduledTime}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: colors.darkSecondary }}>Reason:</Text>
                        <Text style={{ fontWeight: '600', color: colors.dark }}>
                          {selectedAppointment.reason}
                        </Text>
                      </View>

                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: colors.darkSecondary }}>Status:</Text>
                        <Text
                          style={{
                            fontWeight: '600',
                            color:
                              selectedAppointment.status === 'completed'
                                ? colors.success
                                : selectedAppointment.status === 'cancelled'
                                  ? colors.danger
                                  : colors.primary,
                            textTransform: 'capitalize',
                          }}
                        >
                          {selectedAppointment.status === 'in-progress'
                            ? 'In Progress'
                            : selectedAppointment.status}
                        </Text>
                      </View>

                      {selectedAppointment.diagnosis && (
                        <View>
                          <Text style={{ color: colors.darkSecondary, marginBottom: spacing.xs }}>
                            Diagnosis:
                          </Text>
                          <Text style={{ fontWeight: '500', color: colors.dark }}>
                            {selectedAppointment.diagnosis}
                          </Text>
                        </View>
                      )}

                      {selectedAppointment.treatment && (
                        <View>
                          <Text style={{ color: colors.darkSecondary, marginBottom: spacing.xs }}>
                            Treatment:
                          </Text>
                          <Text style={{ fontWeight: '500', color: colors.dark }}>
                            {selectedAppointment.treatment}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Medical History */}
                  {selectedAppointment.medicalHistory &&
                    selectedAppointment.medicalHistory.length > 0 && (
                      <View style={{ marginBottom: spacing.lg }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: colors.dark,
                            marginBottom: spacing.md,
                          }}
                        >
                          Recent Medical History
                        </Text>
                        {selectedAppointment?.medicalHistory?.slice(0, 3).map((history: any, idx: number) => (
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
                            <Text style={{ fontWeight: '600', color: colors.dark }}>
                              {history.title}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color: colors.darkSecondary,
                                marginTop: spacing.xs,
                              }}
                            >
                              {new Date(history.date).toLocaleDateString()}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                  {/* Action Buttons */}
                  {selectedAppointment.status !== 'completed' &&
                    selectedAppointment.status !== 'cancelled' && (
                      <View style={{ gap: spacing.md }}>
                        <TouchableOpacity
                          style={[modalStyles.modalButton, modalStyles.modalButtonPrimary]}
                          onPress={() => {
                            updateAppointmentStatus(
                              selectedAppointment.appointmentId,
                              selectedAppointment.status === 'scheduled'
                                ? 'completed'
                                : 'cancelled',
                            );
                            setState((prev) => ({ ...prev, showDetailModal: false }));
                          }}
                        >
                          <Text style={modalStyles.modalButtonText}>
                            {selectedAppointment.status === 'scheduled'
                              ? 'Start Appointment'
                              : 'Mark Complete'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[modalStyles.modalButton, modalStyles.modalButtonSecondary]}
                          onPress={() => {
                            Alert.alert('Cancel Appointment', 'Are you sure?', [
                              { text: 'No' },
                              {
                                text: 'Yes',
                                onPress: () => {
                                  updateAppointmentStatus(
                                    selectedAppointment.appointmentId,
                                    'cancelled',
                                  );
                                  setState((prev) => ({ ...prev, showDetailModal: false }));
                                },
                              },
                            ]);
                          }}
                        >
                          <Text
                            style={[
                              modalStyles.modalButtonText,
                              modalStyles.modalButtonTextSecondary,
                            ]}
                          >
                            Cancel Appointment
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default DoctorAppointments;
