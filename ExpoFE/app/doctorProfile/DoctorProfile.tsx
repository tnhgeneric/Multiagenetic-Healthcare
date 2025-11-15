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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { profileStyles, colors, spacing } from './styles/doctor.styles';
import { Doctor, DoctorStats, defaultDoctorProfile, defaultDoctorStats } from '../../types/doctor';
import { firestoreService } from '../../services/firestoreService';

/**
 * DoctorProfile.tsx
 * 
 * Component for displaying and editing doctor profile:
 * - View doctor information
 * - Display statistics
 * - Edit profile
 * - Manage availability
 * - View ratings and reviews
 * - Logout functionality
 */

interface Props {
  doctorId: string;
  onLogout: () => void;
  onRefresh?: () => void;
}

interface ComponentState {
  profile: Doctor | null;
  statistics: DoctorStats | null;
  isEditing: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

const DoctorProfile: React.FC<Props> = ({ doctorId, onLogout, onRefresh }) => {
  const [state, setState] = useState<ComponentState>({
    profile: null,
    statistics: null,
    isEditing: false,
    loading: true,
    refreshing: false,
    error: null,
  });

  /**
   * Load doctor profile and statistics
   */
  const loadProfile = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      // Load doctor profile
      const profile = await firestoreService.getDoctorProfile(doctorId);
      if (!profile) {
        throw new Error('Doctor profile not found');
      }

      // Load statistics
      const patients = await firestoreService.getDoctorPatients(doctorId);
      const appointments = await firestoreService.getDoctorAppointments(doctorId);

      const statistics: DoctorStats = {
        totalPatients: patients.length,
        appointmentsToday: appointments.filter(
          (apt) =>
            new Date(apt.scheduledDate).toDateString() === new Date().toDateString(),
        ).length,
        pendingAppointments: appointments.filter(
          (apt) => apt.status === 'scheduled' || apt.status === 'in-progress',
        ).length,
        completedAppointments: appointments.filter(
          (apt) => apt.status === 'completed',
        ).length,
        cancelledAppointments: appointments.filter(
          (apt) => apt.status === 'cancelled',
        ).length,
        averageRating: profile.rating || 0,
        totalReviews: profile.reviewCount || 0,
      };

      setState((prev) => ({
        ...prev,
        profile,
        statistics,
        loading: false,
        refreshing: false,
      }));
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to load profile',
        loading: false,
        refreshing: false,
      }));
    }
  }, [doctorId]);

  /**
   * Initial load
   */
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    setState((prev) => ({ ...prev, refreshing: true }));
    loadProfile();
    if (onRefresh) onRefresh();
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: onLogout,
      },
    ]);
  };

  const { profile, statistics, loading, refreshing, error } = state;

  // Loading state
  if (loading) {
    return (
      <View style={profileStyles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={profileStyles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={profileStyles.centerContainer}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={48}
          color={colors.danger}
        />
        <Text style={profileStyles.emptyText}>Profile not found</Text>
        <TouchableOpacity
          style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: colors.primary,
            borderRadius: 8,
            marginTop: spacing.lg,
          }}
          onPress={handleRefresh}
        >
          <Text style={{ color: colors.white, fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = profile.name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <View style={profileStyles.container}>
      {/* Error Message */}
      {error && (
        <View
          style={{
            backgroundColor: colors.danger,
            padding: spacing.md,
            margin: spacing.md,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: colors.white, fontWeight: '600' }}>{error}</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Header Section */}
        <View style={profileStyles.headerSection}>
          <View style={profileStyles.profileImage}>
            <Text style={profileStyles.profileImageText}>{initials}</Text>
          </View>
          <Text style={profileStyles.profileName}>{profile.name}</Text>
          <Text style={profileStyles.profileSpecialization}>
            {profile.specialization}
          </Text>
        </View>

        {/* Rating Section */}
        {statistics && (
          <View style={profileStyles.profileContent}>
            <View
              style={{
                backgroundColor: colors.white,
                padding: spacing.lg,
                borderRadius: 12,
                marginBottom: spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.lg,
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: 'bold',
                    color: colors.warning,
                  }}
                >
                  {statistics.averageRating.toFixed(1)}
                </Text>
                <View style={{ flexDirection: 'row', marginTop: spacing.sm }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <MaterialCommunityIcons
                      key={star}
                      name={
                        star <= Math.floor(statistics.averageRating)
                          ? 'star'
                          : 'star-outline'
                      }
                      size={14}
                      color={colors.warning}
                    />
                  ))}
                </View>
              </View>

              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.dark,
                    marginBottom: spacing.sm,
                  }}
                >
                  Patient Reviews
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.darkSecondary,
                  }}
                >
                  {statistics.totalReviews} reviews from your patients
                </Text>
              </View>
            </View>

            {/* Statistics Grid */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing.md,
                marginBottom: spacing.lg,
              }}
            >
              {/* Card 1: Total Patients */}
              <View
                style={{
                  width: '48%',
                  backgroundColor: colors.white,
                  padding: spacing.md,
                  borderRadius: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: colors.primary,
                    marginBottom: spacing.sm,
                  }}
                >
                  {statistics.totalPatients}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.darkSecondary,
                  }}
                >
                  Total Patients
                </Text>
              </View>

              {/* Card 2: Completed Appointments */}
              <View
                style={{
                  width: '48%',
                  backgroundColor: colors.white,
                  padding: spacing.md,
                  borderRadius: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.success,
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: colors.success,
                    marginBottom: spacing.sm,
                  }}
                >
                  {statistics.completedAppointments}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.darkSecondary,
                  }}
                >
                  Completed
                </Text>
              </View>

              {/* Card 3: Pending Appointments */}
              <View
                style={{
                  width: '48%',
                  backgroundColor: colors.white,
                  padding: spacing.md,
                  borderRadius: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.warning,
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: colors.warning,
                    marginBottom: spacing.sm,
                  }}
                >
                  {statistics.pendingAppointments}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.darkSecondary,
                  }}
                >
                  Pending
                </Text>
              </View>

              {/* Card 4: Cancelled Appointments */}
              <View
                style={{
                  width: '48%',
                  backgroundColor: colors.white,
                  padding: spacing.md,
                  borderRadius: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.danger,
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: colors.danger,
                    marginBottom: spacing.sm,
                  }}
                >
                  {statistics.cancelledAppointments}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.darkSecondary,
                  }}
                >
                  Cancelled
                </Text>
              </View>
            </View>

            {/* Profile Information */}
            <View style={profileStyles.section}>
              <Text style={profileStyles.sectionTitle}>Professional Information</Text>

              <View style={profileStyles.infoCard}>
                <View style={profileStyles.infoRow}>
                  <Text style={profileStyles.infoLabel}>License Number</Text>
                  <Text style={profileStyles.infoValue}>{profile.licenseNumber}</Text>
                </View>

                <View
                  style={[profileStyles.infoRow, { borderBottomWidth: 0, paddingTop: spacing.md }]}
                >
                  <Text style={profileStyles.infoLabel}>Specialization</Text>
                  <Text style={profileStyles.infoValue}>{profile.specialization}</Text>
                </View>
              </View>
            </View>

            {/* Contact Information */}
            <View style={profileStyles.section}>
              <Text style={profileStyles.sectionTitle}>Contact Information</Text>

              <View style={profileStyles.infoCard}>
                <View style={profileStyles.infoRow}>
                  <Text style={profileStyles.infoLabel}>Email</Text>
                  <Text style={profileStyles.infoValue}>{profile.email}</Text>
                </View>

                <View
                  style={[profileStyles.infoRow, { borderBottomWidth: 0, paddingTop: spacing.md }]}
                >
                  <Text style={profileStyles.infoLabel}>Phone</Text>
                  <Text style={profileStyles.infoValue}>{profile.phone}</Text>
                </View>
              </View>
            </View>

            {/* Hospital & Office */}
            {profile.hospitalAffiliation && (
              <View style={profileStyles.section}>
                <Text style={profileStyles.sectionTitle}>Hospital Affiliation</Text>

                <View style={profileStyles.infoCard}>
                  <View style={profileStyles.infoRow}>
                    <Text style={profileStyles.infoLabel}>Hospital</Text>
                    <Text style={profileStyles.infoValue}>{profile.hospitalAffiliation}</Text>
                  </View>

                  {profile.officeAddress && (
                    <View
                      style={[
                        profileStyles.infoRow,
                        { borderBottomWidth: 0, paddingTop: spacing.md },
                      ]}
                    >
                      <Text style={profileStyles.infoLabel}>Address</Text>
                      <Text style={profileStyles.infoValue}>{profile.officeAddress}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Bio */}
            {profile.bio && (
              <View style={profileStyles.section}>
                <Text style={profileStyles.sectionTitle}>About</Text>

                <View
                  style={{
                    backgroundColor: colors.white,
                    padding: spacing.md,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.dark, lineHeight: 20 }}>
                    {profile.bio}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ gap: spacing.md, marginTop: spacing.lg }}>
              <TouchableOpacity
                style={profileStyles.editButton}
                onPress={() => Alert.alert('Edit Profile', 'Edit feature coming soon')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={18}
                    color={colors.white}
                  />
                  <Text style={profileStyles.editButtonText}>Edit Profile</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={profileStyles.editButton}
                onPress={() =>
                  Alert.alert('Availability', 'Manage office hours coming soon')
                }
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <MaterialCommunityIcons
                    name="clock"
                    size={18}
                    color={colors.white}
                  />
                  <Text style={profileStyles.editButtonText}>Manage Hours</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={profileStyles.logoutButton}
                onPress={handleLogout}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <MaterialCommunityIcons
                    name="logout"
                    size={18}
                    color={colors.white}
                  />
                  <Text style={profileStyles.logoutButtonText}>Logout</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DoctorProfile;
