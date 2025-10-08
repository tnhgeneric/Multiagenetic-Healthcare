
import requests

class InputHandler:
    def enrich_and_send_to_llm(self, user_input, user_id, session_id, workflow, llm_endpoint_url):
        """
        Enrich the user prompt with context and send it to the LLM for MCP/ACL generation.
        Returns the LLM's structured MCP/ACL JSON output.
        """
        # Basic enrichment
        context = {
            "user_id": user_id,
            "session_id": session_id,
            "workflow": workflow
        }
        payload = {
            "prompt": user_input,
            "context": context
        }
        # Send to LLM endpoint (POST request)
        response = requests.post(llm_endpoint_url, json=payload)
        response.raise_for_status()
        return response.json()
    """
    Receives and validates MCP/ACL JSON output from the LLM or user.
    Extracts plan and actions for orchestration.
    Recognizes patient journey queries and builds the correct ACL structure.
    """

    def validate(self, mcp_acl_json):
        # TODO: Implement schema validation
        return True

    def extract_plan(self, mcp_acl_json):
        return mcp_acl_json.get('acl', [])

    def build_acl_for_patient_journey(self, user_input, user_id, session_id):
        """
        Recognize patient journey queries and build ACL for Patient Journey Agent.
        """
        # Simple keyword-based intent recognition (can be replaced with NLP/LLM)
        if "hospital visit" in user_input.lower() or "my journey" in user_input.lower():
            return [{
                "agent": "Patient Journey Agent",
                "action": "get_journey",
                "params": {
                    "patient_id": user_id
                }
            }]
        return []
