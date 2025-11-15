import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './viewhistory.styles';
import BottomNavigation from '../common/BottomNavigation';
import { auth } from '../../config/firebaseConfig';
import {
  getPatientMedicalHistory,
  MedicalHistory,
} from '../../services/firestoreService';

interface HistoryItem {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  icon: string;
}

export default function ViewHistory() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);

  // Sample data fallback
  const sampleHistoryData: HistoryItem[] = [
    {
      id: '1',
      date: '04th April 2025',
      title: 'General Checkup',
      subtitle: 'Dr. Smith - Family Medicine',
      icon: 'stethoscope'
    },
    {
      id: '2',
      date: '28th March 2025',
      title: 'Blood Test Results',
      subtitle: 'Lab Report - Complete Blood Count',
      icon: 'vial'
    },
    {
      id: '3',
      date: '15th March 2025',
      title: 'Vaccination',
      subtitle: 'COVID-19 Booster Shot',
      icon: 'syringe'
    },
  ];

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const loadMedicalHistory = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (user?.uid) {
        const records = await getPatientMedicalHistory(user.uid);
        if (records && records.length > 0) {
          const converted = records.map((record, index) => ({
            id: record.id || index.toString(),
            date: record.date ? new Date(record.date).toLocaleDateString() : 'Unknown Date',
            title: record.title || 'Medical Record',
            subtitle: record.doctor ? `Dr. ${record.doctor}${record.hospital ? ` - ${record.hospital}` : ''}` : 'Medical Professional',
            icon: getIconForVisit(record.type || record.title),
          }));
          setHistoryData(converted.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ));
        } else {
          setHistoryData(sampleHistoryData);
        }
      }
    } catch (error) {
      console.error('Error loading medical history:', error);
      Alert.alert('Error', 'Failed to load medical history');
      setHistoryData(sampleHistoryData);
    } finally {
      setLoading(false);
    }
  };

  const getIconForVisit = (reason?: string): string => {
    if (!reason) return 'stethoscope';
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('blood')) return 'vial';
    if (lowerReason.includes('vaccine')) return 'syringe';
    if (lowerReason.includes('dental')) return 'tooth';
    if (lowerReason.includes('eye')) return 'eye';
    if (lowerReason.includes('prescription')) return 'pills';
    return 'stethoscope';
  };

  const handleBack = () => {
    router.back();
  };

  const handleItemPress = (item: HistoryItem) => {
    // Navigate to detailed view or handle item selection
    console.log('Selected item:', item);
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <FontAwesome5 name={item.icon} size={20} color="#7d4c9e" />
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemDate}>{item.date}</Text>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.chevronContainer}>
        <Feather name="chevron-right" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  const filteredData = historyData.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#7d4c9e" />
          <Text style={{ marginTop: 10, color: '#64748B' }}>Loading medical history...</Text>
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
        <Text style={styles.headerTitle}>Medical History Time Line</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctor, Date..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* History List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredData.length > 0 ? (
          <FlatList
            data={filteredData}
            renderItem={renderHistoryItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <FontAwesome5 name="history" size={48} color="#ccc" />
            <Text style={{ marginTop: 16, fontSize: 16, color: '#999' }}>
              {searchQuery ? 'No history found' : 'No medical history'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="more" />
    </SafeAreaView>
  );
}