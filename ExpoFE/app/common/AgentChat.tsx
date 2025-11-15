import React, { useState, useRef, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { callChatOrchestrate, ChatResponse, AgentResult } from '../../services/backendApi';
import { BACKEND_BASE_URL } from '../../config/backendConfig';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

type Message = { id: string; text: string; from: 'user' | 'agent' };

const AgentChat: React.FC = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Helper functions
  const formatResults = useCallback((results: AgentResult[]): string => {
    if (!results?.length) return 'No response available from the analysis.';
    
    const patientInfo = results.find(r => r.result?.patient_id)?.result?.patient_id;
    const patientHeader = patientInfo ? `Patient ID: ${patientInfo}\n\n` : '';
    
    const formattedMessages = results.map((r: AgentResult) => {
      // Check for errors in the result first
      if (r.result?.error) {
        return `❌ ${r.result.error}`;
      }
      
      if (r.agent === 'patient_journey' && r.result) {
        // Format patient journey results
        const journeySteps = r.result.journey_steps || [];
        const patientName = r.result.patient_name || 'Patient';
        const confidence = r.result.confidence ? (r.result.confidence * 100).toFixed(0) : '0';
        
        // Only display if we have journey steps
        if (!journeySteps || journeySteps.length === 0) {
          return 'ℹ️ No patient journey data available.';
        }
        
        const formattedSteps = journeySteps.map((step: string) => {
          // Add emoji prefix based on content
          if (step.includes('Diagnosed')) {
            return `🔍 ${step}`;
          } else if (step.includes('appointment')) {
            return `📅 ${step}`;
          } else if (step.includes('Test') || step.includes('test')) {
            return `🧪 ${step}`;
          } else if (step.includes('treatment')) {
            return `💊 ${step}`;
          } else if (step.includes('Prescribed')) {
            return `💉 ${step}`;
          }
          return `• ${step}`;
        }).join('\n\n');
        
        return `📋 Patient Journey: ${patientName}\n\n${formattedSteps}\n\nConfidence: ${confidence}%`;
      }
      if (r.agent === 'symptom_analyzer' && r.result) {
        return `Symptom Analysis:\n${r.result.identified_symptoms?.join(', ') || 'No symptoms identified'}\nSeverity: ${r.result.severity_level || 'Unknown'}`;
      }
      if (r.agent === 'disease_prediction' && r.result) {
        return `\nPossible Conditions:\n${r.result.predicted_diseases?.join('\n') || 'No predictions available'}\nConfidence: ${r.result.confidence ? (r.result.confidence * 100).toFixed(0) + '%' : 'Unknown'}`;
      }
      return r.result ? JSON.stringify(r.result, null, 2) : 'No data available';
    }).filter(msg => msg && msg.length > 0);
    
    return patientHeader + formattedMessages.join('\n\n');
  }, []);

  const addMessage = useCallback((text: string, from: 'user' | 'agent') => {
    const msg: Message = { id: String(Date.now()), text, from };
    setMessages(prev => [...prev, msg]);
    setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 100);
  }, []);

  const handleResults = useCallback((resp: ChatResponse) => {
    // Handle immediate results
    if (resp.results?.length) {
      addMessage(formatResults(resp.results), 'agent');
      return;
    }
    
    // Handle MCP/ACL flow
    if (resp.mcp_acl?.actions?.length) {
      // Show processing message
      const processingText = "Processing your request...\n\nPlanned actions:\n" + 
        resp.mcp_acl.actions
          .map(action => `- ${action.agent}: ${action.action}`)
          .join('\n');
      
      addMessage(processingText, 'agent');
      return true; // Indicate we should retry
    }
    
    // Handle no response
    addMessage('No response available from the analysis.', 'agent');
    return false;
  }, [addMessage, formatResults]);

  const waitForResults = useCallback(async (originalPrompt: string, sessionId: string, retryCount = 0, maxRetries = 10) => {
    try {
      const payload = {
        prompt: originalPrompt,
        user_id: 'pat1',
        session_id: sessionId,
        workflow: 'symptom_analysis',
        get_status: true  // Request status update
      };

      console.log(`Retry attempt ${retryCount + 1}/${maxRetries} for session ${sessionId}`);
      const resp = await callChatOrchestrate(payload);
      console.log('Status check response:', JSON.stringify(resp, null, 2));
      
      // Check for completed results
      if (resp?.results?.length) {
        // Check for patient journey results
        const hasPatientJourney = resp.results.some(r => {
          const journeySteps = r.result?.journey_steps;
          return r.agent === 'patient_journey' && 
                 Array.isArray(journeySteps) && 
                 journeySteps.length > 0;
        });
        
        // Check for symptom analysis results
        const hasSymptoms = resp.results.some(r => {
          const symptoms = r.result?.identified_symptoms;
          return r.agent === 'symptom_analyzer' && 
                 Array.isArray(symptoms) && 
                 symptoms.length > 0;
        });
        
        const hasDiseasePrediction = resp.results.some(r => {
          const diseases = r.result?.predicted_diseases;
          return r.agent === 'disease_prediction' && 
                 Array.isArray(diseases) && 
                 diseases.length > 0;
        });

        // Return results if we have patient journey OR both symptoms and disease prediction
        if (hasPatientJourney || (hasSymptoms && hasDiseasePrediction)) {
          console.log('Got complete results:', resp.results);
          addMessage(formatResults(resp.results), 'agent');
          return true;
        }
      }
      
      if (retryCount >= maxRetries) {
        console.log('Max retries reached');
        addMessage('The analysis is taking longer than expected. Please try again and provide more detailed information.', 'agent');
        return false;
      }
      
      // Progressive delay: 3s, 4s, 5s, etc up to 8s
      const delay = Math.min(3000 + (1000 * retryCount), 8000);
      console.log(`Waiting ${delay}ms before next retry`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return waitForResults(originalPrompt, sessionId, retryCount + 1, maxRetries);
    } catch (err) {
      console.error('Retry error:', err);
      if (retryCount < maxRetries - 1) {
        const delay = Math.min(3000 + (1000 * retryCount), 8000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return waitForResults(originalPrompt, sessionId, retryCount + 1, maxRetries);
      }
      return false;
    }
  }, [addMessage, formatResults]);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    
    // Add user message
    const sessionId = String(Date.now());
    addMessage(input.trim(), 'user');
    setInput('');
    setSending(true);

    try {
      const payload = {
        prompt: input.trim(),
        user_id: 'pat1',
        session_id: sessionId,
        workflow: 'symptom_analysis'
      };
      
      const resp = await callChatOrchestrate(payload);
      console.log('Initial response:', JSON.stringify(resp, null, 2));

      if (resp?.results?.length) {
        // If we got immediate results, show them
        addMessage(formatResults(resp.results), 'agent');
      } else if (resp?.mcp_acl?.actions?.length) {
        // Show processing message and start polling for results
        const processingText = "Processing your request...\n\nPlanned actions:\n" + 
          resp.mcp_acl.actions
            .map(action => `- ${action.agent}: ${action.action}`)
            .join('\n');
        
        addMessage(processingText, 'agent');
        // Start polling with original prompt and session ID
        waitForResults(input.trim(), sessionId);
      } else {
        addMessage('No response available from the analysis.', 'agent');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      addMessage(`Error: ${err.message || 'Unknown error occurred'}`, 'agent');
    } finally {
      setSending(false);
    }
  }, [input, addMessage, handleResults, formatResults]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 24}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Agent Chat</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ marginRight: 8, color: '#666', fontSize: 12 }}>{BACKEND_BASE_URL}</Text>
            <TouchableOpacity 
              style={styles.headerBtn} 
              onPress={async () => {
                try {
                  const resp = await fetch(`${BACKEND_BASE_URL}/health`);
                  const txt = await resp.text();
                  alert(`Health check OK: ${resp.status}\n${txt}`);
                } catch (err: any) {
                  alert(`Health check failed: ${err?.message || err}`);
                }
              }}
            >
              <Feather name="cpu" size={18} color="#0a84ff" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'interactive'}
          contentContainerStyle={[styles.list, { paddingBottom: 24, flexGrow: 1 }]}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.from === 'user' ? styles.userBubble : styles.agentBubble]}>
              <Text style={[styles.bubbleText, item.from === 'user' ? styles.userText : styles.agentText]}>
                {item.text}
              </Text>
            </View>
          )}
        />

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={sending ? 'Sending...' : 'Type a message'}
            style={styles.input}
            editable={!sending}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            onFocus={() => setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 120)}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={sending}>
            <Text style={styles.sendText}>{sending ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: { 
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerBtn: { 
    padding: 6 
  },
  title: { 
    fontSize: 18, 
    fontWeight: '700' 
  },
  list: { 
    padding: 16 
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 8,
  },
  userBubble: {
    backgroundColor: '#0a84ff',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    backgroundColor: '#f2f2f7',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  agentText: {
    color: '#000',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
  },
  sendBtn: {
    backgroundColor: '#0a84ff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default AgentChat;