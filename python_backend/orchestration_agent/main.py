
from fastapi import FastAPI

from orchestration.input_handler import InputHandler
from orchestration.task_planner import TaskPlanner

app = FastAPI(title="Orchestration Agent API")


input_handler = InputHandler()
task_planner = TaskPlanner()


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

    # Step 4: (Placeholder) Return sequenced tasks
    return {"sequenced_tasks": sequenced_tasks}
