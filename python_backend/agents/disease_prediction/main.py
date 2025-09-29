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
        # Step 2: Send symptoms to Gemini-Pro LLM
        prompt = f"Given these symptoms: {', '.join(request.symptoms)}, what are the most likely diseases?"
        llm_response = vertex_llm(prompt)
        # Parse LLM response (customize as needed)
        predicted_diseases = [llm_response]  # Replace with actual parsing logic
        result = DiseasePredictionResult(predicted_diseases=predicted_diseases, confidence=0.9)
        return DiseasePredictionResponse(result=result)
    except Exception as e:
        return DiseasePredictionResponse(error=str(e))
