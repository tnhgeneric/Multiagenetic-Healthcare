import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './MyProfile.styles.ts';
import { auth } from '../../../../config/firebaseConfig';
import useUserProfile from '../../../../../hooks/useUserProfile';
import BottomNavigation from '../../../common/BottomNavigation';

interface ProfileItemProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackgroundColor: string;
  onPress: () => void;
  showEditIcon?: boolean;
}

const ProfileItem: React.FC<ProfileItemProps> = ({
  title,
  icon,
  iconColor,
  iconBackgroundColor,
  onPress,
  showEditIcon = true,
}) => {
  return (
    <TouchableOpacity
      style={styles.profileItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View
          style={[styles.itemIcon, { backgroundColor: iconBackgroundColor }]}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text style={styles.itemTitle}>{title}</Text>
      </View>
      {showEditIcon && (
        <View>
          <MaterialIcons name="edit" size={16} />
        </View>
      )}
    </TouchableOpacity>
  );
};

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={[styles.sectionDivider, { backgroundColor: '#8B5CF6' }]} />
    </View>
  );
};

const MyProfileScreen: React.FC = () => {
  const router = useRouter();
  const { uid, data, loading } = useUserProfile();

  const userProfile = {
    fullName: data?.personal?.fullName || auth.currentUser?.displayName || data?.fullName || 'User',
    email: data?.email || auth.currentUser?.email || '',
    profilePicture: data?.personal?.profilePicture || auth.currentUser?.photoURL || '',
  };

  const handleBack = () => {
    router.back();
  };

  const handleUpdateProfile = () => {
    console.log('Update profile pressed');
  };

  const handleChangePassword = () => {
    console.log('Change password pressed');
  };

  const handleContactInformation = () => {
    console.log('Contact information pressed');
  };

  const handleUpdateHealth = () => {
    console.log('Update health pressed');
  };

  const handleUpdateLifeStyle = () => {
    console.log('Update lifestyle pressed');
  };

  const handleHealthCompanion = () => {
    console.log('Health companion pressed');
  };

  const handlePreCheckRecommendations = () => {
    console.log('Pre-check recommendations pressed');
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        console.log('User logged out successfully');
        router.replace('/auth/login');
      })
      .catch((err: any) => {
        console.error('Error signing out:', err);
      });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{ marginTop: 10, color: '#8B5CF6' }}>Loading profile...</Text>
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
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.profileImageContainer}
            activeOpacity={0.8}
          >
            <View
              style={[styles.profileImageGradient, { backgroundColor: '#8B5CF6' }]}
            >
              {userProfile.profilePicture ? (
                <Image source={{ uri: userProfile.profilePicture }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={40} color="#ffffff" />
                </View>
              )}
            </View>
            <View style={[styles.cameraIcon, { backgroundColor: '#8B5CF6' }]}>
              <Ionicons name="camera" size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{userProfile.fullName || 'User'}</Text>
          <Text style={styles.userEmail}>{userProfile.email || 'No email provided'}</Text>

          {/* Health Status Indicator */}
          <View style={[styles.healthStatusContainer, { backgroundColor: '#8B5CF620' }]}>
            <View style={[styles.healthStatusDot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={[styles.healthStatusText, { color: '#8B5CF6' }]}>Health Profile Active</Text>
          </View>
        </View>

        {/* Personal Information Section */}
        <SectionHeader title="Personal Information" />
        <View style={styles.section}>
          <ProfileItem
            title="Update My Profile"
            icon="person-outline"
            iconColor="#8B5CF6"
            iconBackgroundColor="#F3E8FF"
            onPress={handleUpdateProfile}
          />
          <ProfileItem
            title="Change Password"
            icon="lock-closed-outline"
            iconColor="#A855F7"
            iconBackgroundColor="#EDE9FE"
            onPress={handleChangePassword}
          />
          <ProfileItem
            title="Contact Information"
            icon="call-outline"
            iconColor="#C084FC"
            iconBackgroundColor="#F5F3FF"
            onPress={handleContactInformation}
          />
        </View>

        {/* Medical Information Section */}
        <SectionHeader title="Medical Information" />
        <View style={styles.section}>
          <ProfileItem
            title="Update Health Profile"
            icon="medical-outline"
            iconColor="#8B5CF6"
            iconBackgroundColor="#F3E8FF"
            onPress={handleUpdateHealth}
          />
          <ProfileItem
            title="Life Style"
            icon="fitness-outline"
            iconColor="#A855F7"
            iconBackgroundColor="#EDE9FE"
            onPress={handleUpdateLifeStyle}
          />
        </View>

        {/* Health Preferences Section */}
        <SectionHeader title="Health Preferences" />
        <View style={styles.section}>
          <ProfileItem
            title="Your Health Companion"
            icon="heart-outline"
            iconColor="#8B5CF6"
            iconBackgroundColor="#F3E8FF"
            onPress={handleHealthCompanion}
          />
          <ProfileItem
            title="Pre-Check Recommendations"
            icon="checkmark-circle-outline"
            iconColor="#A855F7"
            iconBackgroundColor="#EDE9FE"
            onPress={handlePreCheckRecommendations}
          />
        </View>

        {/* Logout Section */}
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <ProfileItem
            title="Logout"
            icon="log-out-outline"
            iconColor="#DC2626"
            iconBackgroundColor="#FEE2E2"
            onPress={handleLogout}
            showEditIcon={false}
          />
        </View>
      </ScrollView>

      <BottomNavigation activeTab="more" onTabPress={() => { }} />
    </SafeAreaView>
  );
};

export default MyProfileScreen;
