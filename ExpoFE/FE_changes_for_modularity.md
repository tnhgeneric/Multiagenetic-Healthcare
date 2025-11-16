# Migration Guide: ExpoFE Updates for Modular Backend

## Migration Steps Overview
1. Update Configuration Files
2. Update Backend API Integration
3. Modify Chat Component
4. Update Network Security
5. Test Integration

## Prerequisites
- Existing ExpoFE frontend
- Node.js and npm installed
- Access to the new modular backend services

## Step 1: Update Configuration Files

### 1.1 Create/Update Backend Configuration

1. Create or update `config/backendConfig.ts`:
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

### 1.2 Update Expo Configuration

1. Modify `app.json` to include backend URL and Android cleartext settings:
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

## Step 2: Update Backend API Integration

### 2.1 Update API Service

1. Modify or create `services/backendApi.ts`:
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

## Step 3: Update Chat Component

### 3.1 Modify Agent Chat Component

1. Update `app/common/AgentChat.tsx` with new multi-agent support:
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

## Step 4: Dependencies and Network Security

### 4.1 Update Dependencies
```bash
# Install required dependencies
cd ExpoFE
npm install axios @types/axios
```

### 4.2 Android Network Security
1. Create `android/app/src/main/res/xml/network_security_config.xml`:
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

## Step 5: Testing the Integration

### 5.1 Start the Backend Services
```bash
# Terminal 1: Start Prompt Processor
cd python_backend
uvicorn services.prompt_processor:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start Orchestration Agent
cd python_backend
uvicorn orchestration_agent.main:app --reload --host 0.0.0.0 --port 8001

# Terminal 3: Start Disease Prediction
cd python_backend
uvicorn agents.disease_prediction.main:app --host 0.0.0.0 --port 8002

# Terminal 4: Start Symptom Analyzer
cd python_backend
uvicorn agents.symptom_analyzer.main:app --host 0.0.0.0 --port 8003
```

### 5.2 Start the Frontend
```bash
# Clear cache and start Expo
cd ExpoFE
npx expo start -c
```

### 5.3 Test the Integration
1. Open the chat screen
2. Send a test message like "I have fever and cough"
3. Verify the response includes both symptom analysis and disease predictions

## Troubleshooting Guide

### Common Issues and Solutions
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

### Network Errors
1. **"Network Error" in chat**
   - Check if all backend services are running
   - Verify the IP address in `backendConfig.ts`
   - Ensure firewall rules are set up:
     ```powershell
     New-NetFirewallRule -DisplayName "Allow Python FastAPI 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
     New-NetFirewallRule -DisplayName "Allow Python FastAPI 8001" -Direction Inbound -LocalPort 8001 -Protocol TCP -Action Allow
     New-NetFirewallRule -DisplayName "Allow Python FastAPI 8002" -Direction Inbound -LocalPort 8002 -Protocol TCP -Action Allow
     New-NetFirewallRule -DisplayName "Allow Python FastAPI 8003" -Direction Inbound -LocalPort 8003 -Protocol TCP -Action Allow
     ```

2. **Android cleartext traffic issues**
   - Verify `usesCleartextTraffic` is set to true in `app.json`
   - Check network security config is properly set up

3. **CORS issues**
   - Verify the backend services have CORS properly configured
   - Try testing with Postman or curl first

### Verification Steps
1. Test simple message sending
2. Verify symptom analysis output
3. Check disease predictions
4. Test error handling
5. Verify network security on Android

## Migration Checklist

- [ ] Update backend configuration
- [ ] Modify app.json
- [ ] Update API service with MCP/ACL
- [ ] Update AgentChat component
- [ ] Configure Android network security
- [ ] Install dependencies
- [ ] Set up firewall rules
- [ ] Test integration
- [ ] Verify error handling
- [ ] Test on Android device
2. Verify response formatting from multiple agents
3. Check error handling and network issues
4. Validate cleartext traffic on Android devices