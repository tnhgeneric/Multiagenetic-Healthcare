import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './labresults.styles'; 
import BottomNavigation from '../common/BottomNavigation';
import { auth } from '../../config/firebaseConfig';
import {
  getPatientProfile,
  updatePatientProfile,
  PatientProfile,
} from '../../services/firestoreService';

export default function UpdateProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<PatientProfile>>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    bloodType: '',
    allergies: '',
    chronicConditions: [],
    insuranceId: '',
  });

  // Load patient profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (user?.uid) {
          const profile = await getPatientProfile(user.uid);
          if (profile) {
            setFormData(profile);
            console.log('Profile loaded from Firestore');
          } else {
            console.log('No existing profile found');
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleBack = () => {
    router.back();
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName || formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Full name must be at least 3 characters';
    }

    if (formData.phone && !/^[0-9\-\+\(\)\s]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors below');
      return;
    }

    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user?.uid) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const success = await updatePatientProfile(user.uid, formData);
      if (success) {
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof PatientProfile, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#7d4c9e" />
          <Text style={{ marginTop: 10, color: '#64748B' }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Feather name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Your Profile</Text>
      </View>

      {/* Form Content */}
      <ScrollView style={styles.content}>
        {/* Personal Information Section */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' }}>
            Personal Information
          </Text>

          {/* Full Name */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Full Name *</Text>
            <TextInput
              style={[
                { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, color: '#333' },
                errors.fullName ? { borderColor: '#e74c3c' } : {},
              ]}
              placeholder="Enter your full name"
              value={formData.fullName || ''}
              onChangeText={(value) => updateField('fullName', value)}
              editable={!saving}
            />
            {errors.fullName && (
              <Text style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>{errors.fullName}</Text>
            )}
          </View>

          {/* Date of Birth */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Date of Birth</Text>
            <TextInput
              style={[
                { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, color: '#333' },
                errors.dateOfBirth ? { borderColor: '#e74c3c' } : {},
              ]}
              placeholder="YYYY-MM-DD"
              value={formData.dateOfBirth || ''}
              onChangeText={(value) => updateField('dateOfBirth', value)}
              editable={!saving}
            />
            {errors.dateOfBirth && (
              <Text style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>{errors.dateOfBirth}</Text>
            )}
          </View>

          {/* Gender */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Gender</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, color: '#333' }}
              placeholder="Male / Female / Other"
              value={formData.gender || ''}
              onChangeText={(value) => updateField('gender', value)}
              editable={!saving}
            />
          </View>

          {/* Phone */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Phone</Text>
            <TextInput
              style={[
                { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, color: '#333' },
                errors.phone ? { borderColor: '#e74c3c' } : {},
              ]}
              placeholder="+1 (555) 123-4567"
              value={formData.phone || ''}
              onChangeText={(value) => updateField('phone', value)}
              editable={!saving}
              keyboardType="phone-pad"
            />
            {errors.phone && (
              <Text style={{ color: '#e74c3c', fontSize: 12, marginTop: 4 }}>{errors.phone}</Text>
            )}
          </View>
        </View>

        {/* Medical Information Section */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' }}>
            Medical Information
          </Text>

          {/* Blood Type */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Blood Type</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, color: '#333' }}
              placeholder="O+ / A- / B+ / etc."
              value={formData.bloodType || ''}
              onChangeText={(value) => updateField('bloodType', value)}
              editable={!saving}
            />
          </View>

          {/* Allergies */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Known Allergies</Text>
            <TextInput
              style={{ 
                borderWidth: 1, 
                borderColor: '#ddd', 
                padding: 10, 
                borderRadius: 8, 
                color: '#333',
                minHeight: 80,
                textAlignVertical: 'top'
              }}
              placeholder="List any known allergies (medication, food, environmental, etc.)"
              value={formData.allergies || ''}
              onChangeText={(value) => updateField('allergies', value)}
              editable={!saving}
              multiline
            />
          </View>

          {/* Insurance ID */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Insurance ID</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, color: '#333' }}
              placeholder="Your insurance ID number"
              value={formData.insuranceId || ''}
              onChangeText={(value) => updateField('insuranceId', value)}
              editable={!saving}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ marginBottom: 30, flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: '#f0f0f0',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleBack}
            disabled={saving}
          >
            <Text style={{ color: '#333', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 8,
              backgroundColor: '#7d4c9e',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    
      {/* Bottom Navigation */}
      <BottomNavigation activeTab="more" />

    </SafeAreaView>
  );
}
