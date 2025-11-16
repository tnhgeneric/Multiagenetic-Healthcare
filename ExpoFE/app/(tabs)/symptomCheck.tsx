import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Alert
} from 'react-native';
import { getDiagnosisFromSymptoms } from '../../services/diagnosisService';

export default function SymptomCheck() {
    const [symptoms, setSymptoms] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any>(null);

    const handleSubmit = async () => {
        if (!symptoms.trim()) {
            Alert.alert('Please enter your symptoms');
            return;
        }

        setLoading(true);
        try {
            const response = await getDiagnosisFromSymptoms(symptoms);
            setResults(response);
        } catch (error) {
            Alert.alert('Error', 'Failed to get diagnosis. Please try again.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>AI Health Assistant</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Describe your symptoms (e.g., 'I have fever and cough for 2 days')..."
                value={symptoms}
                onChangeText={setSymptoms}
                multiline
                numberOfLines={4}
            />

            <TouchableOpacity 
                style={styles.button}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Analyze Symptoms</Text>
                )}
            </TouchableOpacity>

            {results && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.subtitle}>Analysis Results:</Text>
                    
                    {results.results.map((result: any, index: number) => (
                        <View key={index} style={styles.resultCard}>
                            <Text style={styles.agentTitle}>{result.agent}</Text>
                            {result.agent === 'symptom_analyzer' && result.result && (
                                <View>
                                    <Text>Identified Symptoms:</Text>
                                    {result.result.identified_symptoms.map((symptom: string, i: number) => (
                                        <Text key={i}>• {symptom}</Text>
                                    ))}
                                    <Text>Severity: {result.result.severity_level}</Text>
                                    <Text>Confidence: {(result.result.confidence * 100).toFixed(0)}%</Text>
                                </View>
                            )}
                            {result.agent === 'disease_prediction' && result.result && (
                                <View>
                                    <Text>Possible Conditions:</Text>
                                    {result.result.predicted_diseases.map((disease: string, i: number) => (
                                        <Text key={i} style={styles.disease}>
                                            {i + 1}. {disease}
                                        </Text>
                                    ))}
                                    <Text>Confidence: {(result.result.confidence * 100).toFixed(0)}%</Text>
                                </View>
                            )}
                        </View>
                    ))}

                    <Text style={styles.disclaimer}>
                        Note: This is an AI-powered preliminary analysis. 
                        Please consult a healthcare professional for proper medical diagnosis.
                    </Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resultsContainer: {
        marginTop: 24,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    resultCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    agentTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: '#007AFF',
        textTransform: 'capitalize',
    },
    disease: {
        marginLeft: 8,
        marginVertical: 2,
        color: '#666',
    },
    disclaimer: {
        marginTop: 16,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
    },
});