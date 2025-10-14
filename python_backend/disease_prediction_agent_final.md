# Disease Prediction Agent Implementation Guide

## Table of Contents
1. [Initial Architecture](#initial-architecture)
2. [Migration to Modular Architecture](#migration-to-modular-architecture)
3. [Current Architecture](#current-architecture)
4. [Implementation Details](#implementation-details)
5. [Integration Testing](#integration-testing)
6. [Troubleshooting Guide](#troubleshooting-guide)

## Initial Architecture

### Overview
Initially, we had a monolithic architecture where all functionality was contained in a single FastAPI service:
- Single endpoint at port 8000
- Combined symptom analysis and disease prediction
- Direct integration with frontend
- No separation of concerns

### Original Setup
```plaintext
python_backend/
├── main.py           # All logic in one file
├── requirements.txt
└── models/
    └── ...          # Basic disease prediction models
```

## Migration to Modular Architecture

### Motivation
1. Better separation of concerns
2. Independent scaling of services
3. Easier maintenance and testing
4. More robust error handling
5. Better development workflow

### Step-by-Step Migration Process

1. **Service Separation and Pythonic Architecture**
   - Split into multiple microservices following Pythonic principles
   - Implemented core Pythonic design patterns:
     ```plaintext
     a. SOLID Principles
        - Single Responsibility: Each agent handles one specific task
        - Open/Closed: Easy to extend without modifying existing code
        - Liskov Substitution: Agents can be swapped with different implementations
        - Interface Segregation: Clean API contracts between services
        - Dependency Inversion: High-level modules don't depend on low-level ones
     
     b. Component Organization
        - agents/: Concrete implementations (disease_prediction, symptom_analyzer)
        - orchestration/: Core orchestration logic and workflow management
        - services/: Shared services and utilities
        - common/: Reusable components and utilities
     
     c. Clean Architecture Layers
        - Presentation: FastAPI endpoints
        - Business Logic: Agent-specific processing
        - Data Access: Model interactions and external services
     ```
   
   - Created dedicated ports for each service:
     ```plaintext
     - Port 8000: Prompt Processor
     - Port 8001: Orchestration Agent (Core orchestration with MCP/ACL handling)
     - Port 8002: Disease Prediction (Specialized prediction service)
     - Port 8003: Symptom Analyzer (Natural language processing)
     ```

   - Implemented modular components:
     ```plaintext
     - InputHandler: Validates and processes incoming requests
     - TaskPlanner: Determines workflow and task sequence
     - AgentDispatcher: Routes tasks to appropriate services
     - StateManager: Maintains workflow state
     - ResultAggregator: Combines results from multiple agents
     ```

2. **Network Configuration**
   ```powershell
   # Added firewall rules for each service
   New-NetFirewallRule -DisplayName "Allow Python FastAPI 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Allow Python FastAPI 8001" -Direction Inbound -LocalPort 8001 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Allow Python FastAPI 8002" -Direction Inbound -LocalPort 8002 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Allow Python FastAPI 8003" -Direction Inbound -LocalPort 8003 -Protocol TCP -Action Allow
   ```

## Current Architecture

### Directory Structure
```plaintext
python_backend/
├── agents/
│   ├── disease_prediction/
│   │   ├── main.py
│   │   ├── models.py
│   │   └── utils.py
│   └── symptom_analyzer/
│       └── main.py
├── orchestration/
│   ├── main.py
│   ├── agent_dispatcher.py
│   ├── input_handler.py
│   └── task_planner.py
├── sub_agents/
│   ├── task_handler.py
│   ├── domain_logic.py
│   ├── api_data_connector.py
│   ├── state_manager.py
│   ├── result_formatter.py
│   └── ...
└── services/
  └── prompt_processor/
    └── main.py
```

### Service Architecture
1. **Disease Prediction Agent (Port 8002)**
   - Dedicated to disease prediction
   - Receives structured symptoms
   - Returns predicted diseases with confidence scores

2. **Symptom Analyzer (Port 8003)**
   - Processes natural language input
   - Extracts and standardizes symptoms
   - Determines severity levels

3. **Orchestration Agent (Port 8001)**
   - Coordinates between services
   - Handles MCP/ACL protocol
   - Manages workflow execution

4. **Frontend Integration**
   - Uses MCP/ACL format for requests
   - Communicates with orchestration agent
   - Handles multiple agent responses

## Implementation Details

### Symptom Analyzer Agent
```python
# agents/symptom_analyzer/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any

class SymptomRequest(BaseModel):
    symptoms_text: str

class SymptomResponse(BaseModel):
    identified_symptoms: List[str]
    confidence: float
    severity_level: str

app = FastAPI(title="Symptom Analyzer Agent")

@app.post("/analyze_symptoms", response_model=SymptomResponse)
async def analyze_symptoms(request: SymptomRequest):
    # Natural language processing to extract symptoms
    # Example: "I have fever and cough" -> ["fever", "cough"]
    identified = extract_symptoms(request.symptoms_text)
    
    # Determine severity based on symptom combinations and duration
    severity = calculate_severity(identified)
    
    # Calculate confidence based on clarity of symptoms in text
    confidence = calculate_confidence(request.symptoms_text, identified)
    
    return SymptomResponse(
        identified_symptoms=identified,
        confidence=confidence,
        severity_level=severity
    )
```

### Disease Prediction Agent
```python
# agents/disease_prediction/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any

class DiseaseRequest(BaseModel):
    symptoms: List[str]

class DiseaseResponse(BaseModel):
    predicted_diseases: List[str]
    confidence: float

app = FastAPI(title="Disease Prediction Agent")

@app.post("/predict_disease", response_model=DiseaseResponse)
async def predict_disease(request: DiseaseRequest):
    # Use structured symptoms to predict possible diseases
    predictions = predict_diseases(request.symptoms)
    confidence = calculate_prediction_confidence(predictions)
    
    return DiseaseResponse(
        predicted_diseases=predictions,
        confidence=confidence
    )
```

### MCP/ACL Protocol
```typescript
// Frontend request format
const mcpPayload = {
  mcp_acl: {
    agents: ["symptom_analyzer", "disease_prediction"],
    workflow: "medical_diagnosis",
    actions: [
      {
        agent: "symptom_analyzer",
        action: "analyze_symptoms",
        params: { symptoms_text: userInput }
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
```

## Integration Testing

### Test Workflow
1. User inputs symptoms in natural language
2. Symptom analyzer processes and structures the input
3. Disease prediction generates possible conditions
4. Results are aggregated and returned to frontend

### Example Request/Response
```javascript
// Request
POST http://192.168.1.25:8001/orchestrate
{
  "symptoms_text": "Fever"
}

// Response
{
  "status": "success",
  "results": [
    {
      "agent": "symptom_analyzer",
      "result": {
        "identified_symptoms": ["fever"],
        "confidence": 0.7,
        "severity_level": "low"
      }
    },
    {
      "agent": "disease_prediction",
      "result": {
        "predicted_diseases": [
          "Viral Infection",
          "Bacterial Infection",
          "Influenza",
          "Common Cold",
          "COVID-19",
          "UTI"
        ],
        "confidence": 0.1
      }
    }
  ]
}
```

## Troubleshooting Guide

### Common Issues and Solutions

1. **Network Errors**
   - Verify all services are running
   - Check firewall rules
   - Ensure correct IP and ports in configuration

2. **CORS Issues**
   - Added CORS middleware to FastAPI services
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"]
   )
   ```

3. **Android Cleartext Traffic**
   - Updated app.json for HTTP traffic
   ```json
   {
     "android": {
       "usesCleartextTraffic": true
     }
   }
   ```

### Service Health Checks
```bash
# Test orchestration agent
curl -X POST http://192.168.1.25:8001/orchestrate -H "Content-Type: application/json" -d "..."

# Expected: 200 OK with valid JSON response
```

## Future Improvements

1. **Enhanced Error Handling**
   - Better error propagation
   - Detailed error messages
   - Retry mechanisms

2. **Performance Optimization**
   - Caching frequent predictions
   - Load balancing
   - Response time optimization

3. **Security Enhancements**
   - Authentication
   - Rate limiting
   - Input validation

4. **Monitoring and Logging**
   - Service health monitoring
   - Request/response logging
   - Performance metrics

## Conclusion

The migration from a monolithic to a modular architecture has significantly improved the system's maintainability, scalability, and robustness. The disease prediction agent now operates as an independent service while maintaining seamless integration with other components through the orchestration layer.

Key achievements:
1. Successful service separation
2. Clean API interfaces
3. Robust error handling
4. Efficient inter-service communication
5. Scalable architecture for future enhancements