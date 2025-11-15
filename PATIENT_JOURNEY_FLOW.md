# Patient Journey Query Flow - Full Orchestration Pipeline

## Complete End-to-End Flow

When user enters: **"Show my medical history"** or **"Medical journey for pat1"**

```
1. FRONTEND (ExpoFE - Port 3000)
   └─ AgentChat.tsx
      └─ User enters query: "Show my medical history"
      └─ sendMessage() → calls callChatOrchestrate()

2. PROMPT PROCESSOR (Port 8000)
   └─ Receives user query
   └─ Calls Gemini LLM via LangChain
      └─ LLM analyzes semantic meaning
      └─ Understands this is a "patient_journey" query
      └─ Returns semantic analysis with:
         - intent: "patient_journey"
         - query_type: "medical_history"
         - identified_concepts: ["medical_history", "journey"]
   
3. ORCHESTRATION AGENT - INPUT HANDLER (Port 8001)
   └─ Receives LLM semantic analysis
   └─ Parses and enriches the input
   └─ Extracts patient identifier (or uses default "pat1")
   └─ Adds context data (user_id, session_id, etc.)

4. ORCHESTRATION AGENT - TASK PLANNER (Port 8001)
   └─ Creates execution plan based on semantic intent
   └─ For patient_journey intent:
      └─ Single task: patient_journey agent with action "get_journey"
   └─ Returns sequenced task list

5. ORCHESTRATION AGENT - DISPATCHER (Port 8001)
   └─ Routes task to appropriate sub-agent
   └─ Calls patient_journey sub-agent (Port 8005)
      └─ POST /patient_journey
      └─ Sends enriched params:
         {
           "patient_id": "pat1",
           "query_type": "medical_history",
           "concepts": ["medical_history"],
           "original_query": "Show my medical history"
         }

6. PATIENT JOURNEY AGENT (Port 8005)
   └─ PatientJourneyLogic.get_patient_journey()
   └─ Executes 6 separate Neo4j queries:
      ├─ Query 1: Find patient by ID/name
      ├─ Query 2: Get diagnoses relationships
      ├─ Query 3: Get appointments + doctor/hospital
      ├─ Query 4: Get medications
      ├─ Query 5: Get treatments
      └─ Query 6: Get tests
   
7. NEO4J DATABASE
   └─ Ontology returns patient data with relationships:
      ├─ Patient → HAS_DIAGNOSIS → Diagnosis
      ├─ Patient → HAS_APPOINTMENT → Appointment → WITH_DOCTOR → Doctor
      ├─ Patient → HAS_APPOINTMENT → Appointment → AT_HOSPITAL → Hospital
      ├─ Patient → TAKES_MEDICATION → Medication
      ├─ Patient → RECEIVES_TREATMENT → Treatment
      └─ Patient → UNDERWENT_TEST → Test

8. PATIENT JOURNEY AGENT (Port 8005) - RESULT FORMATTING
   └─ Formats raw Neo4j data:
      └─ journey_steps: [
         "🔍 Diagnosed with Hypertension...",
         "📅 Had a Consultation appointment...",
         "🧪 Had Blood Pressure Test...",
         "💊 Started treatment: Hypertension Management..."
      ]
      └─ confidence: 1.0
      └─ patient_name: "John Doe"

9. ORCHESTRATION AGENT - RESULT AGGREGATOR (Port 8001)
   └─ Collects results from patient_journey agent
   └─ Wraps in response format:
      {
        "agent": "patient_journey",
        "result": {
          "journey_steps": [...],
          "confidence": 1.0,
          "patient_name": "John Doe"
        }
      }

10. FRONTEND - RESULT FORMATTER (ExpoFE)
    └─ AgentChat.tsx formatResults()
    └─ Receives agent results
    └─ For patient_journey agent:
       ├─ Adds emojis based on event type (🔍 📅 🧪 💊 💉)
       ├─ Formats as readable journey timeline
       ├─ Shows patient name
       └─ Displays confidence score
    
11. FRONTEND - DISPLAY (ExpoFE)
    └─ Renders in chat UI:
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

## Key Features

✅ **LLM Semantic Understanding**: Gemini Pro understands any patient journey query phrasing
✅ **Flexible Query Detection**: Works with keywords like:
   - "Show my medical history"
   - "Medical journey"
   - "Patient timeline"
   - "What's my treatment progress"
   - "List all my appointments"
   - etc.

✅ **Multi-Step Pipeline**: Uses full agentic architecture:
   1. Prompt Processor (LLM semantic analysis)
   2. Orchestration Agent (planning & routing)
   3. Patient Journey Sub-Agent (Neo4j queries)
   4. Result Formatting & Display

✅ **Rich Data**: Returns:
   - Diagnoses with descriptions and dates
   - Appointments with doctor names and hospital locations
   - Tests with results and status
   - Treatments with duration and status
   - Medications with dosages and frequency

✅ **Formatted Display**: Chat UI shows:
   - Patient name
   - Chronologically sorted events (newest first)
   - Emoji icons for event types
   - Confidence scores

## Testing

Try entering any of these queries in AgentChat:
- "Show my medical history"
- "What's my patient journey"
- "Give me a summary of my medical timeline"
- "List all my appointments and treatments"
- "My health journey summary"

The LLM will understand the intent and route to patient_journey agent automatically!

## Error Handling

- If patient not found: Returns error message to chat
- If Neo4j connection fails: Returns error message to chat
- If timeout: Chat shows "Analysis taking longer" message and retries up to 10 times

## Performance

- Direct Neo4j queries: ~1-2 seconds
- Full orchestration pipeline: ~3-5 seconds (LLM parsing overhead)
- Chat displays "Processing..." while waiting for results
