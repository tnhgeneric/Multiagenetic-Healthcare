import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from './uploads.styles';
import { auth } from '../../../../config/firebaseConfig';
import authService from '../../../../services/authService';
import { useRouter } from 'expo-router';
import BottomNavigation from '../../../common/BottomNavigation';

interface DocumentResult {
    name: string;
    uri: string;
    type: string;
    size: number;
}

interface FileUploadSectionProps {
    title: string;
    description: string;
    onFileSelect: (file: DocumentResult | null) => void;
    selectedFile: DocumentResult | null;
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBackgroundColor: string;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
    title,
    description,
    onFileSelect,
    selectedFile,
    iconName,
    iconColor,
    iconBackgroundColor,
}) => {
    const handleFileSelect = async () => {
        try {
            // Use ImagePicker as alternative to DocumentPicker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file: any = result.assets[0];
                const documentResult: DocumentResult = {
                    name: file.fileName || file.uri.split('/').pop() || 'file',
                    uri: file.uri,
                    type: file.type || 'file',
                    size: file.fileSize || 0,
                };
                onFileSelect(documentResult);
                return;
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to select file');
            console.error('File selection error:', error);
        }
    };

    return (
        <View style={styles.fileUploadSection}>
            <View style={[styles.sectionIcon, { backgroundColor: iconBackgroundColor }]}>
                <Ionicons name={iconName} size={24} color={iconColor} />
            </View>
            <View style={styles.sectionContent}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.sectionDescription}>{description}</Text>
                <View style={styles.fileUploadContainer}>
                    <TouchableOpacity
                        style={styles.fileUploadButton}
                        onPress={handleFileSelect}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.fileUploadButtonText}>Choose File</Text>
                    </TouchableOpacity>
                    <Text style={styles.fileStatus}>
                        {selectedFile ? selectedFile.name : 'No file chosen'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

interface NavigationItemProps {
    title: string;
    onPress: () => void;
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBackgroundColor: string;
}

const NavigationItem: React.FC<NavigationItemProps> = ({
    title,
    onPress,
    iconName,
    iconColor,
    iconBackgroundColor,
}) => {
    return (
        <TouchableOpacity
            style={styles.navigationItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.navigationIcon, { backgroundColor: iconBackgroundColor }]}>
                <Ionicons name={iconName} size={24} color={iconColor} />
            </View>
            <Text style={styles.navigationTitle}>{title}</Text>
        </TouchableOpacity>
    );
};

const Uploads: React.FC = () => {
    const [medicalVaultFile, setMedicalVaultFile] = useState<DocumentResult | null>(null);
    const [reportsFile, setReportsFile] = useState<DocumentResult | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);

    const router = useRouter();
    const handleBack = () => {
        router.back();
    };

    const handleSearchPastLabRecords = () => {
        Alert.alert('Coming Soon', 'Lab records feature coming soon!');
    };

    const handleGoToPastMedicalHistory = () => {
        Alert.alert('Coming Soon', 'Medical history feature coming soon!');
    };

    const handleFileUpload = (file: DocumentResult | null, type: string) => {
        if (!file) {
            Alert.alert('No file', 'Please select a file first.');
            return;
        }

        setUploading(true);
        try {
            // Show success message for now
            Alert.alert('Success', `${type} uploaded successfully!`);
            if (type === 'Medical Vault') {
                setMedicalVaultFile(null);
            } else {
                setReportsFile(null);
            }
        } catch (error) {
            Alert.alert('Error', `Failed to upload ${type}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleBack}
                >
                    <Feather name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Uploads</Text>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <FileUploadSection
                    title="Medical Vault"
                    description="Upload Diagnosis Cards, Prescriptions, etc."
                    onFileSelect={setMedicalVaultFile}
                    selectedFile={medicalVaultFile}
                    iconName="folder"
                    iconColor="#673AB7"
                    iconBackgroundColor="#f1e6f3ff"
                />

                <FileUploadSection
                    title="My Reports"
                    description="Upload Lab Reports"
                    onFileSelect={setReportsFile}
                    selectedFile={reportsFile}
                    iconName="document-text"
                    iconColor="#673AB7"
                    iconBackgroundColor="#f1e6f3ff"
                />

                <NavigationItem
                    title="Search Past Lab Records"
                    onPress={handleSearchPastLabRecords}
                    iconName="search"
                    iconColor="#673AB7"
                    iconBackgroundColor="#f1e6f3ff"
                />

                <NavigationItem
                    title="Go to Past Medical History"
                    onPress={handleGoToPastMedicalHistory}
                    iconName="time"
                    iconColor="#673AB7"
                    iconBackgroundColor="#f1e6f3ff"
                />
            </ScrollView>
            {/* Bottom Navigation */}
            <BottomNavigation activeTab="none" onTabPress={() => { }} />
        </View>
    );
};

export default Uploads;
