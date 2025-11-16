# Frontend Changes for Modular Architecture

## Configuration Updates

### 1. Backend Configuration (backendConfig.ts)
```typescript
// config/backendConfig.ts
import Constants from 'expo-constants';

function envBackendUrl(): string | undefined {
  try {
    const extras: any = (Constants && (Constants.expoConfig || (Constants.manifest && Constants.manifest.extra))) || {};
    if (extras && extras.backendUrl) return extras.backendUrl;
  } catch (e) {
    // ignore
  }
  return undefined;
}

// Updated to use orchestration agent port
export const BACKEND_BASE_URL: string = envBackendUrl() || 'http://192.168.1.25:8001';
```

### 2. Expo Configuration (app.json)
```json
{
  "expo": {
    "extra": {
      "backendUrl": "http://192.168.1.25:8001"
    },
    "android": {
      "usesCleartextTraffic": true
    }
  }
}
```

## API Integration

### 1. Backend API Service (backendApi.ts)
```typescript
// services/backendApi.ts
import axios from 'axios';
import { BACKEND_BASE_URL } from '../config/backendConfig';

const api = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// New MCP/ACL formatted request
export async function callChatOrchestrate(payload: { 
  prompt: string; 
  user_id: string; 
  session_id: string; 
  workflow: string; 
}) {
  const mcpPayload = {
    mcp_acl: {
      agents: ["symptom_analyzer", "disease_prediction"],
      workflow: "medical_diagnosis",
      actions: [
        {
          agent: "symptom_analyzer",
          action: "analyze_symptoms",
          params: { symptoms_text: payload.prompt }
        },
        {
          agent: "disease_prediction",
          action: "predict_disease",
          params: { symptoms: [] }  // Populated from analyzer
        }
      ],
      data_flow: [
        {
          from: "symptom_analyzer",
          to: "disease_prediction",
          data: "structured_symptoms"
        }
      ]
    }
  };
  
  const resp = await api.post('/orchestrate', mcpPayload);
  return resp.data;
}
```

## UI Component Updates

### 1. Agent Chat Component (AgentChat.tsx)
```typescript
// app/common/AgentChat.tsx
export default function AgentChat() {
  // ... State management ...

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: String(Date.now()), text: input.trim(), from: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const payload = {
        prompt: userMsg.text,
        user_id: 'anonymous',
        session_id: String(Date.now()),
        workflow: 'symptom_analysis'
      };

      const resp = await callChatOrchestrate(payload);
      
      // Enhanced response handling for multiple agents
      let agentText = '';
      if (resp?.results?.length > 0) {
        agentText = resp.results
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

      const agentMsg = { 
        id: String(Date.now() + 1), 
        text: agentText || 'No results available', 
        from: 'agent' 
      };
      setMessages(prev => [...prev, agentMsg]);
    } catch (e: any) {
      console.error('Chat error:', e);
      const errorMsg = { 
        id: String(Date.now() + 2), 
        text: `Error: ${e?.message || 'Unknown error'}`, 
        from: 'agent' 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  // ... UI rendering ...
}
```

## Key Changes Summary

1. **Configuration Updates**:
   - Moved from port 8000 to 8001 for orchestration agent
   - Added Android cleartext traffic support
   - Centralized backend URL configuration

2. **API Integration**:
   - Implemented MCP/ACL protocol
   - Added structured workflow for symptom analysis and disease prediction
   - Handled data flow between agents

3. **UI Enhancements**:
   - Updated response handling for multiple agents
   - Added structured display of symptom analysis and disease predictions
   - Enhanced error handling and user feedback

4. **Error Handling**:
   - Added network error handling
   - Improved error messages
   - Added loading states

## Testing Considerations

1. Test the chat with various symptom inputs
2. Verify response formatting from multiple agents
3. Check error handling and network issues
4. Validate cleartext traffic on Android devices