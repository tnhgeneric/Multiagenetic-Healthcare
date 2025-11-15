import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './labresults.styles'; 
import BottomNavigation from '../common/BottomNavigation';
import { auth } from '../../config/firebaseConfig';
import {
  getRecentLabReports,
  getPatientProfile,
} from '../../services/firestoreService';

interface HealthMetric {
  name: string;
  value: string;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

export default function HealthAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [profileStats, setProfileStats] = useState<any>(null);

  useEffect(() => {
    loadHealthAnalytics();
  }, []);

  const loadHealthAnalytics = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (user?.uid) {
        // Load profile for basic stats
        const profile = await getPatientProfile(user.uid);
        setProfileStats(profile);

        // Load recent lab reports for metrics
        const reports = await getRecentLabReports(user.uid, 10);
        if (reports && reports.length > 0) {
          // Extract health metrics from lab results
          const extractedMetrics: HealthMetric[] = [];
          reports.forEach(report => {
            if (report.results && typeof report.results === 'object') {
              // Convert Record<string, string | number> to array of metrics
              Object.entries(report.results).forEach(([name, value]) => {
                extractedMetrics.push({
                  name: name || 'Metric',
                  value: String(value),
                  unit: report.normalRange?.[name] || '',
                  status: 'good',
                  trend: 'stable',
                });
              });
            }
          });
          
          // Limit to top 6 metrics
          setMetrics(extractedMetrics.slice(0, 6));
        }
      }
    } catch (error) {
      console.error('Error loading health analytics:', error);
      // Use sample metrics
      setMetrics([
        { name: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'good', trend: 'stable' },
        { name: 'Heart Rate', value: '72', unit: 'bpm', status: 'good', trend: 'stable' },
        { name: 'Glucose', value: '95', unit: 'mg/dL', status: 'good', trend: 'stable' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'good':
        return '#27ae60';
      case 'warning':
        return '#f39c12';
      case 'critical':
        return '#e74c3c';
      default:
        return '#7d4c9e';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'good':
        return 'check-circle';
      case 'warning':
        return 'alert-circle';
      case 'critical':
        return 'x-circle';
      default:
        return 'circle';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#7d4c9e" />
          <Text style={{ marginTop: 10, color: '#64748B' }}>Loading health analytics...</Text>
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
        <Text style={styles.headerTitle}>Your Health Analytics</Text>
      </View>

      {/* Body */}
      <ScrollView style={[styles.content, { paddingHorizontal: 16 }]}>
        {/* Profile Summary Card */}
        {profileStats && (
          <View style={{
            backgroundColor: '#7d4c9e',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
              Health Summary
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Blood Type</Text>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 4 }}>
                  {profileStats.bloodType || 'N/A'}
                </Text>
              </View>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Last Visit</Text>
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 4 }}>
                  Recent
                </Text>
              </View>
              <View>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Status</Text>
                <Text style={{ color: '#27ae60', fontSize: 18, fontWeight: '600', marginTop: 4 }}>
                  Active
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Health Metrics */}
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#333' }}>
          Latest Health Metrics
        </Text>

        {metrics.length > 0 ? (
          metrics.map((metric, index) => (
            <View
              key={index}
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: getStatusColor(metric.status),
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>
                    {metric.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#333' }}>
                      {metric.value}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#999', marginLeft: 4 }}>
                      {metric.unit}
                    </Text>
                  </View>
                </View>
                <MaterialIcons
                  name={getStatusIcon(metric.status) as any}
                  size={24}
                  color={getStatusColor(metric.status)}
                />
              </View>
            </View>
          ))
        ) : (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <MaterialIcons name="analytics" size={48} color="#ccc" />
            <Text style={{ marginTop: 16, fontSize: 16, color: '#999' }}>
              No health metrics available
            </Text>
          </View>
        )}

        {/* Additional Stats */}
        <View style={{ marginTop: 20, marginBottom: 30 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#999', marginBottom: 8 }}>
            📊 More statistics coming soon...
          </Text>
          <Text style={{ fontSize: 12, color: '#999' }}>
            Track your health trends, medication compliance, and personalized recommendations.
          </Text>
        </View>
      </ScrollView>
    
      {/* Bottom Navigation */}
      <BottomNavigation activeTab="more" />
    </SafeAreaView>  
  );
}