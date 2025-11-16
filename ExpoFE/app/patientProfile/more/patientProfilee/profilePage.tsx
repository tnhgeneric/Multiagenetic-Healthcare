import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './profilePage.styles'; 
import BottomNavigation from '../../../common/BottomNavigation';
import useUserProfile from '../../../../hooks/useUserProfile';
import { auth } from '../../../../config/firebaseConfig';

interface ProfileStats {
  age: string;
  bloodGroup: string;
  BMI: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
  route?: string;
}

interface PatientProfileScreenProps {
  navigation?: any;
}

const ProfilePage: React.FC<PatientProfileScreenProps> = ({ navigation }) => {
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    age: '...',
    bloodGroup: '...',
    BMI: '...',
  });
  const [userName, setUserName] = useState<string>('...');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string>('https://images.unsplash.com/photo-1494790108755-2616b9e9d1e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80');

  const { data, loading, error: hookError, refresh } = useUserProfile();

  const calculateAge = useCallback((birthdate: Date | string | null): string => {
    if (!birthdate) return 'N/A';
    
    let birthdateObj: Date;
    
    if (typeof birthdate === 'string') {
      try {
        if (birthdate.includes('/')) {
          const [day, month, year] = birthdate.split('/').map(Number);
          birthdateObj = new Date(year, month - 1, day);
        } else {
          birthdateObj = new Date(birthdate);
        }
        
        if (isNaN(birthdateObj.getTime())) {
          console.error('Invalid date format:', birthdate);
          return 'N/A';
        }
      } catch (error) {
        console.error('Error parsing date:', error, 'for date string:', birthdate);
        return 'N/A';
      }
    } else {
      birthdateObj = birthdate;
    }
    
    const today = new Date();
    let ageValue = today.getFullYear() - birthdateObj.getFullYear();
    
    if (
      today.getMonth() < birthdateObj.getMonth() || 
      (today.getMonth() === birthdateObj.getMonth() && today.getDate() < birthdateObj.getDate())
    ) {
      ageValue--;
    }
    
    if (ageValue < 0 || ageValue > 120) {
      console.error('Unlikely age calculated:', ageValue, 'from birthdate:', birthdate, 'parsed as:', birthdateObj.toISOString());
      return 'N/A';
    }
    
    return `${ageValue} yrs`;
  }, []);

  useEffect(() => {
    setIsLoading(loading);
    if (hookError) setError(hookError);
    if (!loading && data) {
      const userData = data as any;
      const full = userData.personal?.fullName || userData.fullName || '';
      setUserName(full || (userData.email ? userData.email.split('@')[0] : 'User'));
      setProfileImage((prev) => userData.personal?.profilePicture || userData.profilePicture || prev);
      const age = userData.personal?.dateOfBirth ? calculateAge(userData.personal.dateOfBirth) : 'N/A';
      setProfileStats({
        age: age,
        bloodGroup: userData.health?.bloodType || 'N/A',
        BMI: userData.health?.bmi || (userData.health?.weight && userData.health?.height ? `${userData.health.weight}kg` : 'N/A')
      });
    }
  }, [loading, data, hookError, calculateAge]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const router = useRouter();

  const menuItems: MenuItem[] = [
    {
      id: 'saved',
      title: 'My Saved',
      icon: 'heart-outline',
      color: '#673AB7',
      route: '/patientProfile/viewHistory/viewhistory'
    },
    {
      id: 'appointment',
      title: 'My Alerts',
      icon: 'calendar-outline',
      color: '#673AB7',
      route: '/patientProfile/notification'
    },
    {
      id: 'edit',
      title: 'My Profile',
      icon: 'person-outline',
      color: '#673AB7',
      route: '/patientProfile/more/patientProfilee/MyProfile'
    },
    {
      id: 'faqs',
      title: 'Help Center',
      icon: 'help-circle-outline',
      color: '#673AB7',
      route: '../common/faqs'
    },
    {
      id: 'About',
      title: 'About LifeFile',
      icon: 'information-circle-outline',
      color: '#673AB7',
      route: '../common/about'
    },
    {
      id: 'Settings',
      title: 'LifeFile Settings',
      icon: 'settings-outline',
      color: '#673AB7',
      route: '../common/settings'
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: 'log-out-outline',
      color: '#9C27B0',
      onPress: () => {
        auth.signOut()
            .then(() => {
              console.log('User logged out successfully');
              router.replace('/auth/login');
            })
            .catch((err: any) => {
              console.error('Error signing out:', err);
            });
      },
    },
  ];

  const renderStatCard = (label: string, value: string, icon: keyof typeof Ionicons.glyphMap) => (
    <View style={styles.statCard}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={20} color="#9C27B0" />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const renderMenuItem = (item: MenuItem) => {
    const handlePress = () => {
      if (item.route) {
        try {
          router.push(item.route as any);
        } catch (error) {
          console.error(`Failed to navigate to ${item.route}:`, error);
          Alert.alert(
            "Coming Soon",
            `The ${item.title} feature is coming soon!`,
            [{ text: "OK" }]
          );
        }
      } else if (item.onPress) {
        item.onPress();
      }
    };
    
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.menuItem}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#673AB7" />
          <Text style={{ marginTop: 10, color: '#666' }}>Loading profile...</Text>
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle-outline" size={50} color="#E91E63" />
          <Text style={{ marginTop: 10, color: '#666', fontSize: 16, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity 
            style={{
              marginTop: 20,
              backgroundColor: '#673AB7',
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 5
            }}
            onPress={async () => { await refresh(); }}
          >
            <Text style={{ color: 'white' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#673AB7"
            />
          }
        >
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            </View>
            <Text style={styles.profileName}>{userName}</Text>
          </View>

          <View style={styles.statsContainer}>
            {renderStatCard('Age', profileStats.age, 'person-outline')}
            {renderStatCard('Blood Group', profileStats.bloodGroup, 'water-outline')}
            {renderStatCard('BMI', profileStats.BMI, 'fitness-outline')}
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map(renderMenuItem)}
          </View>
        </ScrollView>
      )}

      <BottomNavigation activeTab="home" onTabPress={() => { }} />
    </SafeAreaView>
  );
};

export default ProfilePage;
