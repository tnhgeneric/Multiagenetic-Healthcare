
import os
from fastapi import FastAPI, Request
from pydantic import BaseModel
from orchestration.input_handler import InputHandler
from orchestration.task_planner import TaskPlanner
from orchestration.agent_dispatcher import AgentDispatcher

# Initialize FastAPI app ONCE
app = FastAPI(title="Orchestration Agent API")

# LLM endpoint URL (set this to your actual LLM endpoint)
LLM_ENDPOINT_URL = os.getenv("LLM_ENDPOINT_URL", "http://localhost:9000/llm")

# Initialize handlers
input_handler = InputHandler()
task_planner = TaskPlanner()
agent_dispatcher = AgentDispatcher()

# Pydantic model for chat input
class ChatOrchestrateInput(BaseModel):
    prompt: str
    user_id: str
    session_id: str
    workflow: str

@app.post("/chat_orchestrate")
def chat_orchestrate(input_data: ChatOrchestrateInput):
    """Accepts a user prompt and context, enriches it, sends to LLM, then orchestrates."""
    # Step 1: Enrich and send to LLM for MCP/ACL generation
    mcp_acl_json = input_handler.enrich_and_send_to_llm(
        user_input=input_data.prompt,
        user_id=input_data.user_id,
        session_id=input_data.session_id,
        workflow=input_data.workflow,
        llm_endpoint_url=LLM_ENDPOINT_URL
    )
    # Step 2: Validate MCP/ACL JSON
    if not input_handler.validate(mcp_acl_json):
        return {"error": "Invalid MCP/ACL structure from LLM"}

    # Step 3: Extract plan/actions
    plan = input_handler.extract_plan(mcp_acl_json)

    # Step 4: Sequence and enrich tasks
    sequenced_tasks = task_planner.sequence_tasks(plan)

    # Step 5: Dispatch tasks to sub-agents
    dispatch_results = agent_dispatcher.dispatch(sequenced_tasks)

    # Step 6: Return dispatch results
    return {"dispatch_results": dispatch_results}



@app.post("/orchestrate")
def orchestrate(mcp_acl_json: dict):
    """Main orchestration endpoint."""
    # Step 1: Validate MCP/ACL JSON
    if not input_handler.validate(mcp_acl_json):
        return {"error": "Invalid MCP/ACL structure"}

    # Step 2: Extract plan/actions
    plan = input_handler.extract_plan(mcp_acl_json)

    # Step 3: Sequence and enrich tasks
    sequenced_tasks = task_planner.sequence_tasks(plan)

    # Step 4: Dispatch tasks to sub-agents
    dispatch_results = agent_dispatcher.dispatch(sequenced_tasks)

    # Step 5: Return dispatch results
    return {"dispatch_results": dispatch_results}

class DiseasePredictionRequest(BaseModel):
    symptoms: list[str]

@app.post("/predict_disease")
def predict_disease(request: DiseasePredictionRequest):
    """Predict diseases based on symptoms."""
    try:
        # Create MCP/ACL payload for disease prediction
        mcp_acl_json = {
            "user_input": f"Predict diseases for symptoms: {', '.join(request.symptoms)}",
            "workflow": "disease_prediction",
            "mcp": {
                "task": "disease_prediction",
                "input": {"symptoms": request.symptoms},
                "context": {"workflow": "medical_diagnosis"}
            }
        }

        # Send to disease prediction sub-agent via dispatcher
        dispatch_results = agent_dispatcher.dispatch([{
            "agent": "disease_prediction",
            "task": mcp_acl_json
        }])

        # Format the response
        if dispatch_results and len(dispatch_results) > 0:
            result = dispatch_results[0].get("result", {})
            return {
                "result": {
                    "predicted_diseases": result.get("diseases", []),
                    "confidence": result.get("confidence", 0.0)
                }
            }
        return {"error": "No prediction results"}
    except Exception as e:
        return {"error": str(e)}
