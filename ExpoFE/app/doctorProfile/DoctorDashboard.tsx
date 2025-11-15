import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { dashboardStyles, colors, spacing } from './styles/doctor.styles';
import {
  Doctor,
  DoctorStats,
  AppointmentWithPatient,
  PatientBasic,
  defaultDoctorProfile,
  defaultDoctorStats,
} from '../../types/doctor';
import { firestoreService } from '../../services/firestoreService';
import DoctorAppointments from './DoctorAppointments';
import DoctorPatients from './DoctorPatients';
import DoctorProfile from './DoctorProfile';

/**
 * DoctorDashboard.tsx
 * 
 * Main doctor dashboard component providing:
 * - Summary statistics (appointments, patients, etc)
 * - Tab navigation (Appointments, Patients, Profile)
 * - Quick action cards
 * - Real-time data from Firestore
 */
interface Props {
  doctorId?: string;
  onLogout?: () => void;
}

type TabType = 'appointments' | 'patients' | 'profile';

interface DashboardState {
  doctorProfile: Doctor | null;
  statistics: DoctorStats | null;
  todayAppointments: AppointmentWithPatient[];
  upcomingAppointments: AppointmentWithPatient[];
  patientsList: PatientBasic[];
  activeTab: TabType;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

const DoctorDashboard: React.FC<Props> = ({ doctorId: propDoctorId, onLogout }) => {
  const navigation = useNavigation();
  const route = useRoute();

  const [state, setState] = useState<DashboardState>({
    doctorProfile: null,
    statistics: null,
    todayAppointments: [],
    upcomingAppointments: [],
    patientsList: [],
    activeTab: 'appointments',
    loading: true,
    refreshing: false,
    error: null,
  });

  // Get doctor ID from props, route params, or context
  const doctorId = propDoctorId || (route.params as any)?.doctorId || 'current-user-id';

  /**
   * Load doctor data
   */
  const loadDoctorData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      // Load doctor profile
      const profile = await firestoreService.getDoctorProfile(doctorId);
      if (!profile) {
        throw new Error('Doctor profile not found');
      }

      // Load today's appointments
      const todayAppointments = await firestoreService.getDoctorAppointmentsByDate(
        doctorId,
        new Date(),
      );

      // Load upcoming appointments (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const upcomingAppointments = await firestoreService.getDoctorAppointmentsByDate(
        doctorId,
        nextWeek,
      );

      // Load doctor patients
      const patients = await firestoreService.getDoctorPatients(doctorId);

      // Calculate statistics
      const stats: DoctorStats = {
        totalPatients: patients.length,
        appointmentsToday: todayAppointments.length,
        pendingAppointments: todayAppointments.filter(
          (apt) => apt.status === 'scheduled' || apt.status === 'in-progress',
        ).length,
        completedAppointments: todayAppointments.filter(
          (apt) => apt.status === 'completed',
        ).length,
        cancelledAppointments: todayAppointments.filter(
          (apt) => apt.status === 'cancelled',
        ).length,
        averageRating: profile.rating || 0,
        totalReviews: profile.reviewCount || 0,
      };

      setState((prev) => ({
        ...prev,
        doctorProfile: profile,
        statistics: stats,
        todayAppointments,
        upcomingAppointments,
        patientsList: patients,
        loading: false,
        refreshing: false,
      }));
    } catch (error: any) {
      console.error('Error loading doctor data:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to load dashboard data',
        loading: false,
        refreshing: false,
      }));
    }
  }, [doctorId]);

  /**
   * Initial load effect
   */
  useEffect(() => {
    loadDoctorData();
  }, [loadDoctorData]);

  /**
   * Handle tab change
   */
  const handleTabChange = (tab: TabType) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  };

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    setState((prev) => ({ ...prev, refreshing: true }));
    loadDoctorData();
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: () => {
          if (onLogout) {
            onLogout();
          }
          navigation.navigate('Login' as never);
        },
      },
    ]);
  };

  const { doctorProfile, statistics, todayAppointments, loading, refreshing, error, activeTab } =
    state;

  // Loading state
  if (loading) {
    return (
      <View style={dashboardStyles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={dashboardStyles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={dashboardStyles.container}>
      {/* Header */}
      <View style={dashboardStyles.header}>
        <Text style={dashboardStyles.headerTitle}>
          {doctorProfile?.name ? `Dr. ${doctorProfile.name}` : 'Doctor Dashboard'}
        </Text>
        <Text style={dashboardStyles.headerSubtitle}>
          {doctorProfile?.specialization || 'Medical Professional'}
        </Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={dashboardStyles.errorContainer}>
          <Text style={dashboardStyles.errorText}>{error}</Text>
        </View>
      )}

      {/* Summary Cards */}
      <ScrollView
        style={dashboardStyles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Statistics Summary */}
        <View style={dashboardStyles.summaryContainer}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.dark,
              marginBottom: spacing.md,
            }}
          >
            Today's Overview
          </Text>

          <View style={dashboardStyles.summaryGrid}>
            {/* Card 1: Today's Appointments */}
            <TouchableOpacity
              style={dashboardStyles.summaryCard}
              onPress={() => handleTabChange('appointments')}
            >
              <MaterialCommunityIcons
                name="calendar-clock"
                size={32}
                color={colors.primary}
              />
              <Text style={dashboardStyles.summaryNumber}>
                {statistics?.appointmentsToday || 0}
              </Text>
              <Text style={dashboardStyles.summaryLabel}>Appointments Today</Text>
            </TouchableOpacity>

            {/* Card 2: Pending */}
            <TouchableOpacity
              style={dashboardStyles.summaryCard}
              onPress={() => handleTabChange('appointments')}
            >
              <MaterialCommunityIcons name="clock-outline" size={32} color={colors.warning} />
              <Text
                style={[
                  dashboardStyles.summaryNumber,
                  { color: colors.warning },
                ]}
              >
                {statistics?.pendingAppointments || 0}
              </Text>
              <Text style={dashboardStyles.summaryLabel}>Pending</Text>
            </TouchableOpacity>

            {/* Card 3: Total Patients */}
            <TouchableOpacity
              style={dashboardStyles.summaryCard}
              onPress={() => handleTabChange('patients')}
            >
              <MaterialCommunityIcons name="account-multiple" size={32} color={colors.success} />
              <Text
                style={[
                  dashboardStyles.summaryNumber,
                  { color: colors.success },
                ]}
              >
                {statistics?.totalPatients || 0}
              </Text>
              <Text style={dashboardStyles.summaryLabel}>Patients</Text>
            </TouchableOpacity>

            {/* Card 4: Completed */}
            <TouchableOpacity style={dashboardStyles.summaryCard}>
              <MaterialCommunityIcons
                name="check-circle"
                size={32}
                color={colors.success}
              />
              <Text
                style={[
                  dashboardStyles.summaryNumber,
                  { color: colors.success },
                ]}
              >
                {statistics?.completedAppointments || 0}
              </Text>
              <Text style={dashboardStyles.summaryLabel}>Completed</Text>
            </TouchableOpacity>
          </View>

          {/* Rating Card */}
          {statistics && (
            <View style={dashboardStyles.summaryCardLarge}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.dark,
                    marginBottom: spacing.xs,
                  }}
                >
                  Your Rating
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: colors.warning,
                      marginRight: spacing.sm,
                    }}
                  >
                    {statistics.averageRating.toFixed(1)}
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <MaterialCommunityIcons
                        key={star}
                        name={star <= Math.floor(statistics.averageRating) ? 'star' : 'star-outline'}
                        size={16}
                        color={colors.warning}
                      />
                    ))}
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.darkSecondary,
                    marginTop: spacing.xs,
                  }}
                >
                  {statistics.totalReviews} reviews
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Upcoming Appointments Preview */}
        {todayAppointments.length > 0 && (
          <View style={{ marginBottom: spacing.lg }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.dark,
                marginBottom: spacing.md,
              }}
            >
              Upcoming Today
            </Text>
            {todayAppointments.slice(0, 2).map((appointment) => (
              <TouchableOpacity
                key={appointment.appointmentId}
                style={dashboardStyles.summaryCardLarge}
                onPress={() => handleTabChange('appointments')}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={40}
                  color={colors.primary}
                  style={{ marginRight: spacing.md }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.dark,
                    }}
                  >
                    {appointment.patient.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.darkSecondary,
                      marginVertical: spacing.xs,
                    }}
                  >
                    {appointment.scheduledTime} • {appointment.reason}
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.xs,
                      backgroundColor:
                        appointment.status === 'scheduled' ? colors.primaryLight : colors.lightGray,
                      borderRadius: 4,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: appointment.status === 'scheduled' ? colors.primary : colors.dark,
                        fontWeight: '600',
                        textTransform: 'capitalize',
                      }}
                    >
                      {appointment.status}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Tab Navigation */}
      <View style={dashboardStyles.tabContainer}>
        {(['appointments', 'patients', 'profile'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              dashboardStyles.tab,
              activeTab === tab && dashboardStyles.tabActive,
            ]}
            onPress={() => handleTabChange(tab)}
          >
            <MaterialCommunityIcons
              name={
                tab === 'appointments'
                  ? 'calendar-check'
                  : tab === 'patients'
                    ? 'account-multiple'
                    : 'account-circle'
              }
              size={20}
              color={activeTab === tab ? colors.primary : colors.darkSecondary}
              style={{ marginBottom: spacing.xs }}
            />
            <Text
              style={[
                dashboardStyles.tabLabel,
                activeTab === tab && dashboardStyles.tabLabelActive,
              ]}
            >
              {tab === 'appointments'
                ? 'Appointments'
                : tab === 'patients'
                  ? 'Patients'
                  : 'Profile'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'appointments' && (
        <DoctorAppointments doctorId={doctorId} onRefresh={handleRefresh} />
      )}
      {activeTab === 'patients' && <DoctorPatients doctorId={doctorId} onRefresh={handleRefresh} />}
      {activeTab === 'profile' && (
        <DoctorProfile
          doctorId={doctorId}
          onLogout={handleLogout}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

export default DoctorDashboard;
