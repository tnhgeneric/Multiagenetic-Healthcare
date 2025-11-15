import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    FlatList,
    ActivityIndicator,
    Alert,
    TextInput,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import styles from './labresults.styles';
import BottomNavigation from '../common/BottomNavigation';
import { auth } from '../../config/firebaseConfig';
import {
    getActiveMedications,
    Medication,
} from '../../services/firestoreService';

interface MedicationWithStatus extends Medication {
    daysRemaining?: number;
    refillStatus?: 'OK' | 'Low' | 'Critical';
}

export default function ActiveMedications() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [medications, setMedications] = useState<MedicationWithStatus[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadMedications();
    }, []);

    const loadMedications = async () => {
        try {
            setLoading(true);
            const user = auth.currentUser;
            if (user?.uid) {
                const data = await getActiveMedications(user.uid);
                if (data && data.length > 0) {
                    // Add calculated fields
                    const withStatus = data.map(med => ({
                        ...med,
                        daysRemaining: calculateDaysRemaining(med.endDate),
                        refillStatus: 'OK' as const,
                    }));
                    setMedications(withStatus);
                } else {
                    setMedications([]);
                }
            }
        } catch (error) {
            console.error('Error loading medications:', error);
            Alert.alert('Error', 'Failed to load medications');
        } finally {
            setLoading(false);
        }
    };

    const calculateDaysRemaining = (endDate?: string): number => {
        if (!endDate) return 0;
        const end = new Date(endDate);
        const today = new Date();
        const diff = end.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };

    const calculateRefillStatus = (quantity: number): 'OK' | 'Low' | 'Critical' => {
        if (quantity <= 0) return 'Critical';
        if (quantity <= 7) return 'Low';
        return 'OK';
    };

    const getRefillStatusColor = (status?: string): string => {
        switch (status) {
            case 'Critical':
                return '#e74c3c';
            case 'Low':
                return '#f39c12';
            default:
                return '#27ae60';
        }
    };

    const handleBack = () => {
        router.back();
    };

    const filteredMedications = medications.filter(med =>
        med.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.dosage?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderMedicationItem = ({ item }: { item: MedicationWithStatus }) => (
        <TouchableOpacity
            style={{
                backgroundColor: '#f8f9fa',
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: getRefillStatusColor(item.refillStatus),
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 }}>
                        {item.name}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>
                        Dosage: {item.dosage}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#999', marginBottom: 8 }}>
                        Frequency: {item.frequency}
                    </Text>
                    {item.daysRemaining !== undefined && (
                        <Text style={{ fontSize: 12, color: getRefillStatusColor(item.refillStatus), fontWeight: '600' }}>
                            {item.daysRemaining} days remaining
                        </Text>
                    )}
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons
                        name={item.refillStatus === 'Critical' ? 'alert-circle' : 'check-circle'}
                        size={24}
                        color={getRefillStatusColor(item.refillStatus)}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#7d4c9e" />
                    <Text style={{ marginTop: 10, color: '#64748B' }}>Loading medications...</Text>
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
                <Text style={styles.headerTitle}>Active Medications</Text>
            </View>

            {/* Search Bar */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 10 }}>
                    <Feather name="search" size={18} color="#999" />
                    <TextInput
                        style={{ flex: 1, paddingVertical: 10, marginLeft: 8, color: '#333' }}
                        placeholder="Search medications..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Medications List */}
            <ScrollView style={[styles.content, { paddingHorizontal: 16 }]}>
                {filteredMedications.length > 0 ? (
                    <FlatList
                        data={filteredMedications}
                        renderItem={renderMedicationItem}
                        keyExtractor={(item, index) => item.id || index.toString()}
                        scrollEnabled={false}
                    />
                ) : (
                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                        <MaterialCommunityIcons name="pill" size={48} color="#ccc" />
                        <Text style={{ marginTop: 16, fontSize: 16, color: '#999' }}>
                            {searchQuery ? 'No medications found' : 'No active medications'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Navigation */}
            <BottomNavigation activeTab="more" />
        </SafeAreaView>
    );
}