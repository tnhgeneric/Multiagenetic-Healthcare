import os
from fastapi import FastAPI, Body
from langchain_google_vertexai import ChatVertexAI
from neo4j import GraphDatabase
from typing import Optional
import re

app = FastAPI()

llm = ChatVertexAI(
    model="gemini-2.5-pro",  # latest Gemini model
    temperature=0.2,
    max_output_tokens=512,
    location="us-central1"
)

# Neo4j connection setup (use environment variables for security)
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")
driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

def extract_patient_name(prompt: str) -> Optional[str]:
    # Simple heuristic: look for 'John Doe' or similar in the prompt
    # In production, use NLP or regex for better extraction
    match = re.search(r"([A-Z][a-z]+ [A-Z][a-z]+)", prompt)
    if match:
        return match.group(1)
    return None

def get_patient_journey(name: str) -> str:
    # Query Neo4j for the patient's journey (customize as per your ontology)
    with driver.session() as session:
        result = session.run(
            """
            MATCH (p:Patient {name: $name})-[:ADMITTED_TO|HAS_EVENT*]->(e)
            RETURN p.name AS name, collect(DISTINCT labels(e)) AS events, collect(DISTINCT e) AS details
            """,
            name=name
        )
        record = result.single()
        if record:
            details = record["details"]
            # Format each node's properties for readability
            journey_steps = []
            for node in details:
                label = list(node.labels)[0] if node.labels else "Unknown"
                props = dict(node)
                # Example: show hospital name, event type, etc.
                if label == "Hospital":
                    step = f"Admitted to {props.get('name', 'Unknown Hospital')} at {props.get('location', '')}"
                elif label == "Diagnosis":
                    step = f"Diagnosed with {props.get('condition', 'Unknown Condition')} on {props.get('date', '')}"
                elif label == "Treatment":
                    step = f"Received treatment: {props.get('treatment', 'Unknown Treatment')} on {props.get('date', '')}"
                else:
                    step = f"{label}: {props}"
                journey_steps.append(step)
            journey_str = " -> ".join(journey_steps) if journey_steps else "No detailed events found."
            return f"Patient {name} journey: {journey_str}"
        else:
            return f"No journey found for patient {name}."

@app.post("/ask")
async def ask(prompt: str = Body(..., embed=True)):
    patient_name = extract_patient_name(prompt)
    journey_context = ""
    if patient_name:
        journey_context = get_patient_journey(patient_name)
    full_prompt = f"{journey_context}\nUser asks: {prompt}" if journey_context else prompt
    response = llm.invoke(full_prompt)
    return {"response": response.content, "context": journey_context}
