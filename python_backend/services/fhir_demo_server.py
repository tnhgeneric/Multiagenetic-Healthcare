from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any

app = FastAPI(title="FHIR Demo Server")

# Mock FHIR database
mock_patient_data = {
    "P123": {
        "entry": [
            {
                "resource": {
                    "resourceType": "Observation",
                    "code": {
                        "coding": [
                            {
                                "display": "headache"
                            }
                        ]
                    },
                    "effectiveDateTime": "2025-11-08T10:00:00Z",
                    "interpretation": [
                        {
                            "text": "severe"
                        }
                    ]
                }
            },
            {
                "resource": {
                    "resourceType": "Observation",
                    "code": {
                        "coding": [
                            {
                                "display": "nausea"
                            }
                        ]
                    },
                    "effectiveDateTime": "2025-11-08T10:00:00Z",
                    "interpretation": [
                        {
                            "text": "moderate"
                        }
                    ]
                }
            }
        ]
    },
    "P456": {
        "entry": [
            {
                "resource": {
                    "resourceType": "Observation",
                    "code": {
                        "coding": [
                            {
                                "display": "fever"
                            }
                        ]
                    },
                    "effectiveDateTime": "2025-11-08T09:00:00Z",
                    "interpretation": [
                        {
                            "text": "high"
                        }
                    ]
                }
            }
        ]
    }
}

@app.get("/Patient/{patient_id}/Observation")
async def get_patient_observations(patient_id: str):
    """Get patient observations from FHIR database"""
    if patient_id not in mock_patient_data:
        raise HTTPException(status_code=404, detail="Patient not found")
    return mock_patient_data[patient_id]

@app.get("/health")
async def health_check():
    return {"status": "healthy"}