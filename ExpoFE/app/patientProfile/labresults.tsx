import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './labresults.styles';
import BottomNavigation from '../common/BottomNavigation';
import { auth } from '../../config/firebaseConfig';
import {
  getRecentLabReports,
  LabReport,
} from '../../services/firestoreService';

interface LabResult {
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'high' | 'low';
}

interface LabReportDisplay {
  id: string;
  name: string;
  results: LabResult[];
  pdfUrl?: string;
  imageUrl?: string;
  type: 'pdf' | 'image';
  testDate?: string;
}

interface DateGroup {
  date: string;
  reports: LabReportDisplay[];
}

export default function LabReports() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'results' | 'trends'>('results');
  const [loading, setLoading] = useState(true);
  const [labData, setLabData] = useState<DateGroup[]>([]);

  // Sample data fallback
  const sampleLabData: DateGroup[] = [
    {
      date: '04 April 2025',
      reports: [
        {
          id: '1',
          name: 'Creatinine',
          results: [
            { name: 'Creatinine', value: 0.83, unit: 'mg/dL', status: 'normal' }
          ],
          type: 'pdf',
          pdfUrl: 'sample-lab-report.pdf'
        },
        {
          id: '2',
          name: 'TSH',
          results: [
            { name: 'TSH', value: 1.385, unit: 'mIU/L', status: 'normal' }
          ],
          type: 'pdf',
          pdfUrl: 'sample-tsh-report.pdf'
        },
        {
          id: '3',
          name: 'Fasting Glucose',
          results: [
            { name: 'Fasting Glucose', value: 89.60, unit: 'mg/dL', status: 'normal' }
          ],
          type: 'image',
          imageUrl: 'sample-glucose-report.jpg'
        }
      ]
    }
  ];

  useEffect(() => {
    loadLabReports();
  }, []);

  const loadLabReports = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (user?.uid) {
        const reports = await getRecentLabReports(user.uid, 50);
        if (reports && reports.length > 0) {
          // Group by date
          const grouped = groupByDate(reports);
          setLabData(grouped);
        } else {
          setLabData(sampleLabData);
        }
      }
    } catch (error) {
      console.error('Error loading lab reports:', error);
      setLabData(sampleLabData);
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (reports: LabReport[]): DateGroup[] => {
    const grouped: Record<string, LabReportDisplay[]> = {};
    
    reports.forEach(report => {
      const dateStr = report.testDate ? new Date(report.testDate).toLocaleDateString() : 'Unknown Date';
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      
      // Convert Firestore format to display format
      const displayReport: LabReportDisplay = {
        id: report.id || '',
        name: report.testType || 'Lab Report',
        results: report.results || [],
        pdfUrl: report.pdfUrl,
        imageUrl: report.imageUrl,
        type: (report.pdfUrl ? 'pdf' : 'image') as 'pdf' | 'image',
        testDate: report.testDate,
      };
      
      grouped[dateStr].push(displayReport);
    });

    return Object.entries(grouped).map(([date, reports]) => ({
      date,
      reports,
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleBack = () => {
    router.back();
  };

  const handleLabReportPress = (report: LabReportDisplay) => {
    // Navigate to detailed lab report view
    router.push({
      pathname: '/patientProfile/detailedLab',
      params: {
        reportId: report.id,
        reportName: report.name,
        reportType: report.type,
        reportUrl: report.pdfUrl || report.imageUrl,
        results: JSON.stringify(report.results)
      }
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'high': return '#ef4444';
      case 'low': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getStatusBackgroundColor = (status: string): string => {
    switch (status) {
      case 'high': return '#fef2f2';
      case 'low': return '#fef3c7';
      default: return '#dcfce7';
    }
  };

  const renderLabReportItem = (report: LabReportDisplay) => (
    <TouchableOpacity
      key={report.id}
      style={styles.labReportContainer}
      onPress={() => handleLabReportPress(report)}
      activeOpacity={0.7}
    >
      {/* PDF/Image Preview */}
      <View style={styles.previewContainer}>
        {report.type === 'pdf' ? (
          <View style={styles.pdfPreview}>
            <MaterialIcons name="picture-as-pdf" size={24} color="#ef4444" />
            <Text style={styles.pdfText}>PDF</Text>
          </View>
        ) : (
          <View style={styles.imagePreview}>
            <MaterialIcons name="image" size={24} color="#6366f1" />
            <Text style={styles.imageText}>IMG</Text>
          </View>
        )}
      </View>

      {/* Report Details */}
      <View style={styles.reportDetails}>
        <Text style={styles.reportName}>{report.name}</Text>
        {Array.isArray(report.results) && report.results.map((result: LabResult, index: number) => (
          <View key={index} style={styles.resultRow}>
            <Text style={styles.resultValue}>
              {result.value} {result.unit}
            </Text>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: getStatusBackgroundColor(result.status) }
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(result.status) }
              ]} />
            </View>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderDateGroup = ({ item }: { item: DateGroup }) => (
    <View style={styles.dateGroupContainer}>
      <Text style={styles.dateHeader}>{item.date}</Text>
      <View style={styles.reportsContainer}>
        {item.reports.map(report => renderLabReportItem(report))}
      </View>
    </View>
  );

  const renderHealthTrends = () => (
    <View style={styles.trendsContainer}>
      <Text style={styles.trendsPlaceholder}>
        Health trends visualization will be displayed here
      </Text>
    </View>
  );

  const filteredData = labData.filter(dateGroup =>
    dateGroup.reports.some(report =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.results.some(result =>
        result.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ) || dateGroup.date.toLowerCase().includes(searchQuery.toLowerCase())
  ).map(dateGroup => ({
    ...dateGroup,
    reports: dateGroup.reports.filter(report =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.results.some(result =>
        result.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) || dateGroup.date.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }));

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
        <Text style={styles.headerTitle}>Lab Reports</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search from Date, Keyword"
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'results' && styles.activeTab]}
          onPress={() => setActiveTab('results')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'results' && styles.activeTabText
          ]}>
            Lab Results
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trends' && styles.activeTab]}
          onPress={() => setActiveTab('trends')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'trends' && styles.activeTabText
          ]}>
            Health Trends
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color="#7d4c9e" />
            <Text style={{ marginTop: 10, color: '#64748B' }}>Loading lab reports...</Text>
          </View>
        ) : activeTab === 'results' ? (
          <FlatList
            data={filteredData}
            renderItem={renderDateGroup}
            keyExtractor={item => item.date}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          renderHealthTrends()
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation activeTab="more" />
    </SafeAreaView>
  );
}