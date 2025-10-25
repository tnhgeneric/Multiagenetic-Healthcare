# End-to-End Flow: Beginner Friendly Guide

This document explains the full flow of your multi-agent healthcare app, from the moment a user opens the app to when they receive a disease prediction. Each step is described in simple terms for easy understanding.

---

## 1. User Journey in the Frontend

### a. Welcome Screen
- The user opens the app and sees the Welcome Screen.
- They can choose to start chatting with the agent by tapping the chat button (which navigates to the Agent Chat screen).

### b. Agent Chat Screen
- The user types a message describing their symptoms (e.g., "I have a headache and fever") and presses Send.
- The chat UI immediately displays the user's message.

### c. Preparing the Request (Enrichment in Frontend)
- The chat screen calls a function (`callChatOrchestrate`) from the `backendApi.ts` service.
- This function takes the user's message and wraps it in a special JSON structure called MCP/ACL. This structure includes:
  - The list of agents to use (e.g., `symptom_analyzer`, `disease_prediction`)
  - The workflow name (e.g., `medical_diagnosis`)
  - The actions each agent should perform (with parameters)
  - How data should flow between agents (e.g., symptoms extracted by the analyzer are sent to the disease predictor)
- This is called "basic enrichment" and ensures the backend knows exactly what to do.

---

## 2. Backend Orchestration Agent (Port 8001)

### a. Receiving the Request
- The frontend sends the enriched MCP/ACL JSON to the backend's `/orchestrate` endpoint.
- The backend expects the request to already be in this format.

### b. Validation
- The backend checks that the request has all required fields (agents, workflow, actions, data_flow).
- If the structure is invalid, it returns an error.

### c. Task Planning and Sequencing
- The backend extracts the list of actions and their order from the MCP/ACL JSON.
- It sequences the tasks so each agent is called in the right order.

### d. Dispatching to Sub-Agents
- The backend sends the user's symptoms to the `symptom_analyzer` agent.
- The analyzer extracts structured symptoms (e.g., ["headache", "fever"]).
- The backend then sends these structured symptoms to the `disease_prediction` agent.
- The disease prediction agent uses an LLM (like Gemini-Pro) to predict possible diseases and confidence scores.

### e. Aggregating Results
- The backend collects results from all agents.
- It combines them into a single response and sends it back to the frontend.

---

## 3. Displaying Results in the Frontend

- The frontend receives the response from the backend.
- It displays the results in the chat (e.g., "Possible Conditions: Flu, Common Cold. Confidence: 80%.")
- The user can continue chatting, and the process repeats.

---

## 4. Key Points

- **Enrichment (MCP/ACL structuring) happens in the frontend** before sending to the backend.
- The backend orchestration agent expects a pre-structured request and does not do enrichment itself.
- Sub-agents (like symptom analyzer and disease predictor) are called in sequence, and their results are combined for the user.
- The LLM (Gemini-Pro) is used by the disease prediction agent, not directly by the frontend or orchestration agent.

---

## 5. Example Data Flow

1. **User:** "I have a headache and fever"
2. **Frontend:**
   - Builds MCP/ACL JSON:
```json
{
  "mcp_acl": {
    "agents": ["symptom_analyzer", "disease_prediction"],
    "workflow": "medical_diagnosis",
    "actions": [
      { "agent": "symptom_analyzer", "action": "analyze_symptoms", "params": { "symptoms_text": "I have a headache and fever" } },
      { "agent": "disease_prediction", "action": "predict_disease", "params": { "symptoms": [] } }
    ],
    "data_flow": [
      { "from": "symptom_analyzer", "to": "disease_prediction", "data": "structured_symptoms" }
    ]
  }
}
```
3. **Backend:**
   - Validates and sequences tasks
   - Calls symptom analyzer → gets ["headache", "fever"]
   - Calls disease predictor with those symptoms → gets ["Flu", "Common Cold"]
   - Aggregates and returns results
4. **Frontend:**
   - Displays: "Possible Conditions: Flu, Common Cold. Confidence: 80%."

---

## 6. System Architecture Diagram

Below is a beginner-friendly diagram showing the end-to-end flow of your multi-agent healthcare app, from frontend user input to backend disease prediction and response.

```
┌─────────────────────────────┐
│        User (Frontend)      │
│  (WelcomeScreen, AgentChat) │
└─────────────┬───────────────┘
              │
              │ 1. User enters symptoms
              ▼
┌──────────────────────────────────────────────┐
│      Frontend API (backendApi.ts)            │
│  - Wraps user input in MCP/ACL JSON          │
└─────────────┬────────────────────────────────┘
              │ 2. Sends MCP/ACL JSON
              ▼
┌──────────────────────────────────────────────┐
│   Orchestration Agent (Backend)              │
│   /orchestrate endpoint                      │
│   - input_handler: validates MCP/ACL         │
│   - task_planner: plans tasks                │
│   - agent_dispatcher: dispatches to agents   │
└─────────────┬────────────────────────────────┘
              │ 3. Dispatches to symptom_analyzer
              ▼
┌──────────────────────────────────────────────┐
│   Symptom Analyzer Agent                     │
│   - Extracts structured symptoms             │
└─────────────┬────────────────────────────────┘
              │ 4. Returns symptoms
              ▼
┌──────────────────────────────────────────────┐
│   Orchestration Agent                        │
│   - Receives symptoms                        │
│   - Plans next task                          │
│   - Dispatches to disease_prediction agent   │
└─────────────┬────────────────────────────────┘
              │ 5. Dispatches to disease_prediction
              ▼
┌──────────────────────────────────────────────┐
│   Disease Prediction Agent                   │
│   - Calls Gemini LLM for prediction          │
└─────────────┬────────────────────────────────┘
              │ 6. Returns prediction
              ▼
┌──────────────────────────────────────────────┐
│   Orchestration Agent                        │
│   - Aggregates results                       │
│   - Prepares response                        │
└─────────────┬────────────────────────────────┘
              │ 7. Sends response
              ▼
┌──────────────────────────────────────────────┐
│   Frontend API (backendApi.ts)               │
│   - Receives and displays results            │
└─────────────┬────────────────────────────────┘
              │ 8. User sees results
              ▼
┌─────────────────────────────┐
│        User (Frontend)      │
└─────────────────────────────┘
```

---

## 7. Symptom Analyzer Agent: Example Implementation

The symptom analyzer agent is a FastAPI service that receives raw symptom text and extracts structured symptoms using simple keyword matching. Here is a summary of its logic:

- Receives a POST request at `/analyze_symptoms` with a JSON body containing `symptoms_text`.
- Converts the text to lowercase and checks for keywords (e.g., "headache", "fever", etc.).
- Returns a list of identified symptoms, a confidence score, and a severity level (high/medium/low) based on the number of symptoms found.

**Sample code excerpt:**

```python
@app.post("/analyze_symptoms", response_model=SymptomAnalyzerResponse)
def analyze_symptoms(request: SymptomAnalyzerRequest):
    try:
        text = request.symptoms_text.lower()
        identified_symptoms = []
        symptom_map = {
            'headache': ['headache', 'head pain', 'head ache'],
            'nausea': ['nausea', 'nauseous', 'feeling sick'],
            'fever': ['fever', 'high temperature', 'temperature'],
            'cough': ['cough', 'coughing'],
            'fatigue': ['fatigue', 'tired', 'exhausted'],
            'pain': ['pain', 'ache', 'sore'],
            'dizziness': ['dizzy', 'dizziness', 'light-headed', 'light headed']
        }
        for symptom, keywords in symptom_map.items():
            if any(keyword in text for keyword in keywords):
                identified_symptoms.append(symptom)
        if len(identified_symptoms) >= 4:
            severity = "high"
            confidence = 0.9
        elif len(identified_symptoms) >= 2:
            severity = "medium"
            confidence = 0.8
        else:
            severity = "low"
            confidence = 0.7
        result = SymptomAnalysisResult(
            identified_symptoms=identified_symptoms,
            confidence=confidence,
            severity_level=severity
        )
        return SymptomAnalyzerResponse(result=result)
    except Exception as e:
        return SymptomAnalyzerResponse(error=str(e))
```

---

## 8. Summary of Confirmed Flow and Roles

- **Frontend (WelcomeScreen, AgentChat, backendApi.ts):**
  - Collects user input and enriches it into MCP/ACL JSON.
  - Sends requests and displays results.
- **Orchestration Agent (Backend):**
  - Validates, plans, dispatches, and aggregates tasks.
  - Does not enrich or call LLM directly.
- **Symptom Analyzer Agent:**
  - Extracts symptoms from text using keyword matching.
- **Disease Prediction Agent:**
  - Calls Gemini LLM for disease prediction.
- **Gemini LLM:**
  - Only called by the disease prediction agent.

All enrichment (MCP/ACL structuring) is done in the frontend. The orchestration agent expects pre-enriched input and does not perform enrichment itself. The Gemini LLM is only called by the disease_prediction agent. The flow as described is correct and matches the codebase.

---

## 9. Improved Architecture Diagram (with Prompt Processor & Service Layer)

Below is a simple, modernized architecture diagram reflecting best practices and agentic AI patterns:

```
┌─────────────────────────────┐
│        User (Frontend)      │
│  (WelcomeScreen, AgentChat) │
└─────────────┬───────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│      Frontend API (backendApi.ts)            │
└─────────────┬────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│         Prompt Processor (Backend)           │
│  - Validates, normalizes, enriches prompts   │
│  - Injects user context, templates, etc.     │
└─────────────┬────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│   Orchestration Agent (Backend)              │
│   - Plans, sequences, dispatches tasks       │
│   - Aggregates results                      │
└─────────────┬────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│         Service Layer (Backend)              │
│  - Reusable logic: enrichment, logging, etc. │
└─────────────┬────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│         Agents (Pluggable)                   │
│  - Symptom Analyzer                         │
│  - Disease Prediction (calls Gemini LLM)     │
│  - ...future agents                         │
└─────────────┬────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────┐
│      Feedback Loop & State Manager           │
│  - Collects user feedback, manages context   │
└──────────────────────────────────────────────┘
```

**Key improvements:**
- Prompt Processor centralizes prompt logic and enrichment.
- Service Layer enables code reuse and extensibility.
- Agents are modular and pluggable.
- Feedback and state management support learning and personalization.
