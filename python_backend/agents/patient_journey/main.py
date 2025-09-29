
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Patient Journey Agent API")

class SymptomPrompt(BaseModel):
    symptoms: List[str]

@app.post("/patient_journey")
def handle_patient_journey(prompt: SymptomPrompt):
    # Step 1: Capture user symptoms from prompt
    # Next step: Send symptoms to LLM for disease prediction
    return {"received_symptoms": prompt.symptoms}
