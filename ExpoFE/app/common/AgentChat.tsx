import React, { useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { callChatOrchestrate } from '../../services/backendApi';
import { BACKEND_BASE_URL } from '../../config/backendConfig';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

type Message = { id: string; text: string; from: 'user' | 'agent' };

export default function AgentChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: String(Date.now()), text: input.trim(), from: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const payload = {
        prompt: userMsg.text,
        user_id: 'anonymous',
        session_id: String(Date.now()),
        workflow: 'symptom_analysis'  // Use the symptom analysis workflow
      };
      const resp = await callChatOrchestrate(payload);
      console.log('Orchestrate response:', JSON.stringify(resp, null, 2));
      
      // Parse the orchestrate response
      let agentText = '';
      if (resp?.dispatch_results?.length > 0) {
        // Combine responses from all agents
        agentText = resp.dispatch_results
          .map((r: any) => {
            if (r.agent === 'symptom_analyzer' && r.result) {
              return `Symptom Analysis:\n${r.result.identified_symptoms?.join(', ') || 'No symptoms identified'}\nSeverity: ${r.result.severity_level || 'Unknown'}`;
            }
            if (r.agent === 'disease_prediction' && r.result) {
              return `\nPossible Conditions:\n${r.result.predicted_diseases?.join('\n') || 'No predictions available'}\nConfidence: ${r.result.confidence ? (r.result.confidence * 100).toFixed(0) + '%' : 'Unknown'}`;
            }
            return r.result ? JSON.stringify(r.result, null, 2) : '';
          })
          .filter((text: string) => text)
          .join('\n\n');
      }
      
      if (!agentText) {
        agentText = 'No results available from the analysis. Response: ' + JSON.stringify(resp, null, 2);
      }
      
      const agentMsg: Message = { id: String(Date.now() + 1), text: agentText, from: 'agent' };
      setMessages(prev => [...prev, agentMsg]);
      // scroll to bottom
      setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 100);
    } catch (e: any) {
      console.error('Chat error:', {
        error: e,
        response: e?.response,
        data: e?.response?.data,
        status: e?.response?.status,
        headers: e?.response?.headers,
        config: e?.config,
        message: e?.message,
      });
      const errorDetail = e?.response?.data?.detail || e?.message || 'Unknown error';
      const errMsg: Message = { id: String(Date.now() + 2), text: `Error: ${errorDetail}`, from: 'agent' };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

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
            <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/common/DiseasePrediction')}>
              <Feather name="bar-chart-2" size={20} color="#0a84ff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerBtn, { marginLeft: 8 }]} onPress={async () => {
              try {
                const resp = await fetch(`${BACKEND_BASE_URL}/orchestrate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mcp: {}, acl: [] }) });
                const txt = await resp.text();
                alert(`Ping OK: ${resp.status}\n${txt}`);
              } catch (e: any) {
                alert(`Ping failed: ${e?.message || e}`);
              }
            }}>
              <Feather name="cpu" size={18} color="#0a84ff" />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'interactive'}
          contentContainerStyle={[styles.list, { paddingBottom: 24, flexGrow: 1 }]}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.from === 'user' ? styles.userBubble : styles.agentBubble]}>
              <Text style={[styles.bubbleText, item.from === 'user' ? styles.userText : styles.agentText]}>{item.text}</Text>
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
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerBtn: { padding: 6 },
  title: { fontSize: 18, fontWeight: '700' },
  list: { padding: 12, paddingBottom: 20 },
  bubble: { marginVertical: 6, padding: 10, borderRadius: 10, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#007aff' },
  agentBubble: { alignSelf: 'flex-start', backgroundColor: '#f1f0f0' },
  bubbleText: { fontSize: 15 },
  userText: { color: '#fff' },
  agentText: { color: '#000' },
  inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderTopColor: '#eee', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginRight: 8 },
  sendBtn: { paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#0a84ff', borderRadius: 8 },
  sendText: { color: '#fff', fontWeight: '600' }
});
