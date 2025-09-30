class InputHandler:
    """
    Receives and validates MCP/ACL JSON output from the LLM.
    Extracts plan and actions for orchestration.
    """
    def validate(self, mcp_acl_json):
        # TODO: Implement schema validation
        return True

    def extract_plan(self, mcp_acl_json):
        return mcp_acl_json.get('acl', [])
