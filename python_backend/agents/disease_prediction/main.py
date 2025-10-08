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
    symptoms: List[str]

class DiseasePredictionResult(BaseModel):
    predicted_diseases: List[str]
    confidence: float

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


@app.post("/predict_disease", response_model=DiseasePredictionResponse)
def predict_disease(request: DiseasePredictionRequest):
    if not vertex_llm:
        return DiseasePredictionResponse(error="VertexAI or API keys not configured. Please install langchain-google-vertexai and set environment variables.")
    try:
        # Step 1: Enrich prompt with MCP/ACL
        mcp_prompt = MCPACLPrompt(
            symptoms=request.symptoms,
            context="Disease prediction for healthcare workflow"
        )
        # Build the prompt string for LLM
        prompt = (
            f"Protocol: {mcp_prompt.protocol}\n"
            f"Agent: {mcp_prompt.agent}\n"
            f"Action: {mcp_prompt.action}\n"
            f"Context: {mcp_prompt.context}\n"
            f"Symptoms: {', '.join(mcp_prompt.symptoms)}\n"
        )
        # Step 2: Send enriched prompt to Gemini-Pro LLM
        llm_response = vertex_llm(prompt)
        # Step 3: Package LLM response in MCP/ACL format
        mcp_response = {
            "protocol": "MCP",
            "agent": "disease_prediction",
            "action": "predict_disease_result",
            "context": "Disease prediction result for healthcare workflow",
            "llm_raw_response": llm_response
        }
        predicted_diseases = [llm_response]  # Replace with actual parsing logic
        result = DiseasePredictionResult(predicted_diseases=predicted_diseases, confidence=0.9)
        # Optionally, you can include mcp_response in the API response for orchestration
        return DiseasePredictionResponse(result=result)
    except Exception as e:
        return DiseasePredictionResponse(error=str(e))
