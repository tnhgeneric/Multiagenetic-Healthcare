import os
from dotenv import load_dotenv
load_dotenv()
print("GOOGLE_APPLICATION_CREDENTIALS:", os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
print("GOOGLE_CLOUD_PROJECT:", os.getenv("GOOGLE_CLOUD_PROJECT"))

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import os

# LangChain and Vertex AI imports
try:
    from langchain_google_vertexai import VertexAI
except ImportError:
    VertexAI = None

app = FastAPI(title="Disease Prediction Agent API")


# MCP/ACL structures
class MCPACLPrompt(BaseModel):
    protocol: str = "MCP"
    agent: str = "disease_prediction"
    action: str = "predict_disease"
    context: Optional[str] = None
    symptoms: List[str]

class DiseasePredictionRequest(BaseModel):
    symptoms: Optional[List[str]] = None
    patient_id: Optional[str] = None
    severity_level: Optional[str] = "medium"
    semantic_context: Optional[dict] = None

class DiseasePredictionResult(BaseModel):
    predicted_diseases: List[str]
    confidence: float
    symptoms_used: List[str]
    severity_level: str
    patient_id: Optional[str] = None  # Add patient ID to result

class DiseasePredictionResponse(BaseModel):
    result: Optional[DiseasePredictionResult] = None
    error: Optional[str] = None

GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")

# Initialize Vertex AI LLM via LangChain (if available)
vertex_llm = None
if VertexAI and GOOGLE_CLOUD_PROJECT:
    vertex_llm = VertexAI(
        project=GOOGLE_CLOUD_PROJECT,
        model_name="gemini-2.5-pro"
    )


from sub_agents.domain_logic import DomainLogic

domain_logic = DomainLogic()

@app.post("/predict_disease", response_model=DiseasePredictionResponse)
def predict_disease(request: DiseasePredictionRequest):
    try:
        print(f"Disease prediction request: {request}")
        
        # Forward the request to domain logic
        result = domain_logic.predict_disease({
            'patient_id': request.patient_id,
            'symptoms': request.symptoms or [],
            'severity_level': request.severity_level,
            'semantic_context': request.semantic_context
        })
        
        print(f"Domain logic result: {result}")
        
        if not result.get('predicted_diseases'):
            return DiseasePredictionResponse(error="No predictions available")
            
        # Convert to response model
        prediction_result = DiseasePredictionResult(
            predicted_diseases=result['predicted_diseases'],
            confidence=result['confidence'],
            symptoms_used=result['symptoms_used'],
            severity_level=result['severity_level'],
            patient_id=request.patient_id  # Include patient ID in response
        )
        
        print(f"Returning prediction: {prediction_result}")
        return DiseasePredictionResponse(result=prediction_result)
        
    except Exception as e:
        import traceback
        error_details = f"Error in disease prediction: {str(e)}\n{traceback.format_exc()}"
        print(error_details)
        return DiseasePredictionResponse(error=error_details)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Response format template
RESPONSE_TEMPLATE = """{
    "predicted_diseases": ["Disease1", "Disease2"],
    "confidence": 0.85,
    "explanation": "Brief explanation of the predictions",
    "severity": "low/medium/high",
    "recommendation": "Brief medical recommendation"
}"""

@app.post("/llm_predict", response_model=DiseasePredictionResponse)
async def llm_predict(request: DiseasePredictionRequest):
    try:
        if not vertex_llm:
            return DiseasePredictionResponse(error="Vertex AI LLM not initialized")

        # Prepare prompt with symptoms
        prompt = f"Based on the following symptoms: {', '.join(request.symptoms or [])}\n"
        prompt += "Please provide a disease prediction in this format:\n"
        prompt += RESPONSE_TEMPLATE

        # Send to Gemini-Pro LLM
        llm_response = vertex_llm(prompt)

        # Try to extract structured disease predictions
        import json
        try:
            # Try to find JSON content in the response
            start_idx = llm_response.find('{')
            end_idx = llm_response.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = llm_response[start_idx:end_idx]
                parsed_response = json.loads(json_str)
                diseases = parsed_response.get('predicted_diseases', [])
                confidence = parsed_response.get('confidence', 0.8)
            else:
                # Fallback: treat the whole response as a disease prediction
                diseases = [d.strip() for d in llm_response.split(',') if d.strip()]
                confidence = 0.7
        except json.JSONDecodeError:
            # If JSON parsing fails, use the raw response
            diseases = [llm_response.strip()]
            confidence = 0.6

        result = DiseasePredictionResult(
            predicted_diseases=diseases,
            confidence=confidence,
            symptoms_used=request.symptoms or [],
            severity_level=request.severity_level or "medium"
        )
        return DiseasePredictionResponse(result=result)
    except Exception as e:
        return DiseasePredictionResponse(error=str(e))
