# Patient Journey Integration - Testing Guide

## Prerequisites

Ensure all services are running:

```
✓ Neo4j Database (neo4j+s://d8be03e2.databases.neo4j.io)
✓ Spring Backend (Port 8000 - Prompt Processor)
✓ Orchestration Agent (Port 8001)
✓ Disease Prediction Agent (Port 8002)
✓ Symptom Analyzer Agent (Port 8003)
✓ Patient Journey Agent (Port 8005)
✓ Frontend - ExpoFE (running in emulator/device)
```

## Test Cases

### Test 1: Basic Patient Journey Query

**Input:**
```
"Show my medical history"
```

**Expected Flow:**
1. Frontend sends to orchestration (port 8001)
2. LLM detects "patient_journey" intent
3. Routes to patient_journey agent (port 8005)
4. Returns journey data with emojis

**Expected Output in Chat:**
```
📋 Patient Journey: John Doe

🔍 Diagnosed with Hypertension (High blood pressure) on 2024-01-15

📅 Had a Consultation appointment on 2024-01-20 (Completed) 
   with Dr. Jane Smith at City General Hospital

🧪 Had Blood Pressure Test on 2024-01-20 - Result: 140/90 
   (Status: Completed)

💊 Started treatment: Hypertension Management from 2024-01-21 
   to 2024-06-21 (Status: Ongoing)

Confidence: 100%
```

### Test 2: Medical Timeline Query

**Input:**
```
"What's my medical timeline"
```

**Expected Behavior:**
- Same as Test 1 (LLM recognizes this as patient_journey query)
- Should return same journey data

### Test 3: Treatment History Query

**Input:**
```
"List all my treatments and medications"
```

**Expected Behavior:**
- LLM detects patient_journey intent
- Returns journey with focus on treatments and medications

### Test 4: Symptom Analysis (Verify Existing Functionality Still Works)

**Input:**
```
"I have a headache and fever for 3 days"
```

**Expected Flow:**
1. LLM detects "medical_diagnosis" intent
2. Routes to symptom_analyzer and disease_prediction agents
3. Returns diagnosis results

**Expected Output in Chat:**
```
Symptom Analysis:
headache, fever, 3 day duration

Possible Conditions:
Common Cold
Influenza
Viral Infection

Confidence: 87%
```

### Test 5: With Different Patient ID

**Input:**
```
"Show medical journey for patient pat1"
```

**Expected Behavior:**
- System extracts patient ID "pat1"
- Returns patient journey for pat1

## Debugging Checklist

If journey query doesn't work:

- [ ] Check Neo4j is connected (test via Spring backend)
- [ ] Verify patient "pat1" exists in Neo4j database
- [ ] Check port 8005 patient_journey service is running
- [ ] Review browser console for network errors
- [ ] Check if LLM correctly identifies intent (check port 8000 logs)
- [ ] Verify orchestration agent correctly routes (check port 8001 logs)

## Console Logs to Check

### Frontend Console (Browser DevTools)
```
Initial response: {...MCP/ACL actions...}
Retry attempt 1/10 for session ...
Status check response: {...results...}
```

### Patient Journey Agent Logs (Port 8005)
```
Starting patient journey query for patient_id: pat1
Fetching diagnoses...
Fetching appointments...
Query completed successfully
```

### Orchestration Agent Logs (Port 8001)
```
Processing patient_journey task
Dispatching to patient_journey agent
Agent returned results
```

## Manual Testing via API (Using PowerShell)

### Test Patient Journey API directly (Port 8005)

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8005/patient_journey" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"patient_id": "pat1"}'

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### Test via Orchestration Agent (Port 8001)

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:8001/orchestrate" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "prompt": "Show my medical history",
    "user_id": "test_user",
    "session_id": "test_session_123",
    "workflow": "patient_journey_tracking"
  }'

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

## Expected API Response

```json
{
  "result": {
    "journey_steps": [
      "Started treatment: Hypertension Management from 2024-01-21 to 2024-06-21 (Status: Ongoing)",
      "Had a Consultation appointment on 2024-01-20 (Completed) with Dr. Jane Smith at City General Hospital",
      "Had Blood Pressure Test on 2024-01-20 - Result: 140/90 (Status: Completed)",
      "Diagnosed with Hypertension (High blood pressure) on 2024-01-15"
    ],
    "confidence": 1.0,
    "patient_name": "John Doe"
  },
  "error": null
}
```

## Performance Metrics

- Orchestration Pipeline: ~3-5 seconds
  - LLM semantic analysis: ~1-2s
  - Neo4j queries: ~1-2s
  - Result formatting: ~0.5s

- Chat retries: Max 10 retries with exponential backoff (3s to 8s)

## Success Criteria

✅ User enters any patient journey query
✅ LLM correctly identifies intent as "patient_journey"
✅ Orchestration agent routes to patient_journey sub-agent
✅ Neo4j returns complete journey data
✅ Frontend displays formatted journey with emojis
✅ Chat shows journey in readable timeline format
✅ Confidence score displays correctly
