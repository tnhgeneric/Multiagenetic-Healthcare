import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import axios from 'axios';
import Constants from 'expo-constants';
import { BACKEND_BASE_URL } from '../../config/backendConfig';

export default function DebugScreen() {
  const [testResult, setTestResult] = useState('Not tested');

  const testBackend = async () => {
    try {
      setTestResult('Testing...');
      const response = await axios.get(`${BACKEND_BASE_URL}/health`);
      setTestResult(`Success: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      setTestResult(`Error: ${error.message}\n\nDetails: ${JSON.stringify({
        config: error.config,
        response: error.response?.data,
        status: error.response?.status
      }, null, 2)}`);
    }
  };

  const configInfo = {
    backendUrl: BACKEND_BASE_URL,
    expoConfig: Constants.expoConfig?.extra || {},
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Debug Information</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backend Configuration:</Text>
        <Text>URL: {BACKEND_BASE_URL}</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={testBackend}>
          <Text style={styles.buttonText}>Test Backend Connection</Text>
        </TouchableOpacity>
        <Text style={styles.label}>Test Result:</Text>
        <Text style={styles.value}>{testResult}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Configuration:</Text>
        <Text style={styles.value}>{JSON.stringify(configInfo, null, 2)}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  value: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
});