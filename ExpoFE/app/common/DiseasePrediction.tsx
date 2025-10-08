import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { callPredictDisease } from '../../services/backendApi';

export default function DiseasePrediction() {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const submit = async () => {
    const toks = symptoms.split(',').map(s => s.trim()).filter(Boolean);
    if (toks.length === 0) return;
    setLoading(true);
    setResult(null);
    try {
      const resp = await callPredictDisease({ symptoms: toks });
      if (resp?.result?.predicted_diseases) {
        setResult(`Predicted: ${resp.result.predicted_diseases.join(', ')}\nConfidence: ${resp.result.confidence}`);
      } else if (resp?.error) {
        setResult(`Error: ${resp.error}`);
      } else {
        setResult(JSON.stringify(resp));
      }
    } catch (e: any) {
      setResult('Error: could not contact backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Disease Prediction</Text>
        <Text style={styles.label}>Enter symptoms (comma separated):</Text>
        <TextInput value={symptoms} onChangeText={setSymptoms} placeholder="fever, cough, fatigue" style={styles.input} multiline />
        <TouchableOpacity style={styles.btn} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Predict</Text>}
        </TouchableOpacity>

        {result ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  label: { marginBottom: 6, color: '#444' },
  input: { minHeight: 80, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 12, textAlignVertical: 'top' },
  btn: { backgroundColor: '#0a84ff', padding: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  resultBox: { marginTop: 16, padding: 12, borderRadius: 8, backgroundColor: '#f6f8fa' },
  resultText: { color: '#111' }
});
