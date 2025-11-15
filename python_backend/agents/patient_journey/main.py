
import os
from dotenv import load_dotenv
load_dotenv()
print("GOOGLE_APPLICATION_CREDENTIALS:", os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
print("GOOGLE_CLOUD_PROJECT:", os.getenv("GOOGLE_CLOUD_PROJECT"))

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

# LangChain and Vertex AI imports
try:
    from langchain_google_vertexai import VertexAI
except ImportError:
    VertexAI = None

app = FastAPI(title="Patient Journey Agent API")

# MCP/ACL structures (customize as needed for patient journey)
class MCPACLPrompt(BaseModel):
    protocol: str = "MCP"
    agent: str = "patient_journey"
    action: str = "analyze_journey"
    context: Optional[str] = None
    symptoms: List[str]

class PatientJourneyRequest(BaseModel):
    prompt: Optional[str] = None
    patient_id: Optional[str] = None
    symptoms: List[str] = []

class PatientJourneyResult(BaseModel):
    journey_steps: List[str]
    confidence: float
    patient_name: Optional[str] = None

class PatientJourneyResponse(BaseModel):
    result: Optional[PatientJourneyResult] = None
    error: Optional[str] = None

GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")

# Initialize Vertex AI LLM via LangChain (if available)
vertex_llm = None
if VertexAI and GOOGLE_CLOUD_PROJECT:
    vertex_llm = VertexAI(
        project=GOOGLE_CLOUD_PROJECT,
        model_name="gemini-2.5-pro"
    )

from .domain_logic import PatientJourneyLogic

# Initialize domain logic
patient_journey_logic = PatientJourneyLogic()

@app.post("/patient_journey", response_model=PatientJourneyResponse)
def handle_patient_journey(request: PatientJourneyRequest):
    try:
        if not request.patient_id:
            return PatientJourneyResponse(error="patient_id is required")

        # Query patient journey from Neo4j
        journey_data = patient_journey_logic.get_patient_journey(request.patient_id)
        
        if "error" in journey_data:
            return PatientJourneyResponse(error=journey_data["error"])

        # Return journey steps
        result = PatientJourneyResult(
            journey_steps=journey_data.get("journey_steps", []),
            confidence=1.0,
            patient_name=journey_data.get("patient_name")
        )
        return PatientJourneyResponse(result=result)
    except Exception as e:
        import traceback
        print(f"[ERROR] Failed to process patient journey: {e}")
        print(traceback.format_exc())
        return PatientJourneyResponse(error=str(e))
    except Exception as e:
        return PatientJourneyResponse(error=str(e))
