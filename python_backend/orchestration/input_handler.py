
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import logging

# Configure logging
logger = logging.getLogger(__name__)

class SemanticContext(BaseModel):
    intent: str
    identified_concepts: List[str]
    confidence: float
    temporal_context: Optional[Dict[str, Any]] = None
    severity_indicators: Optional[List[str]] = None

class InputHandler:
    """
    Handles semantically enriched MCP/ACL validation and preparation for task planning.
    Processes semantic context for improved task planning and agent coordination.
    """
    
    def validate(self, mcp_acl_json: Dict[str, Any]) -> bool:
        """
        Validates the structure and content of enriched MCP/ACL JSON
        """
        try:
            # Validate required top-level structure
            required_fields = ["agents", "workflow", "actions", "data_flow"]
            if not all(field in mcp_acl_json for field in required_fields):
                logger.error("Missing required MCP/ACL fields")
                return False

            # Validate semantic enrichment if present
            if "semantic_context" in mcp_acl_json:
                try:
                    SemanticContext(**mcp_acl_json["semantic_context"])
                except Exception as e:
                    logger.error(f"Invalid semantic context: {str(e)}")
                    return False

            # Validate actions with semantic parameters
            for action in mcp_acl_json["actions"]:
                if not all(field in action for field in ["agent", "action", "params"]):
                    logger.error(f"Invalid action structure: {action}")
                    return False
                
                # Validate semantic parameters in action
                params = action["params"]
                if "semantic_understanding" in params:
                    if not isinstance(params["semantic_understanding"], dict):
                        logger.error("Invalid semantic understanding format in params")
                        return False

            # Validate data flow
            for flow in mcp_acl_json["data_flow"]:
                if not all(field in flow for field in ["from", "to", "data"]):
                    logger.error(f"Invalid data flow: {flow}")
                    return False

            return True
        except Exception as e:
            logger.error(f"Validation error: {str(e)}")
            return False

    def extract_plan(self, mcp_acl_json: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extracts executable plan from semantically enriched MCP/ACL,
        incorporating semantic understanding into task planning
        """
        if not self.validate(mcp_acl_json):
            raise ValueError("Invalid MCP/ACL structure")

        # Get semantic context if available
        semantic_context = None
        if "semantic_context" in mcp_acl_json:
            try:
                semantic_context = SemanticContext(**mcp_acl_json["semantic_context"])
                logger.info(f"Using semantic context with intent: {semantic_context.intent}")
            except Exception as e:
                logger.warning(f"Could not parse semantic context: {str(e)}")

        # Extract ordered list of actions with their dependencies
        plan = []
        for action in mcp_acl_json["actions"]:
            # Find related data flows
            input_flows = [
                flow for flow in mcp_acl_json["data_flow"]
                if flow["to"] == action["agent"]
            ]
            output_flows = [
                flow for flow in mcp_acl_json["data_flow"]
                if flow["from"] == action["agent"]
            ]

            # Enrich action parameters with semantic understanding
            enriched_params = action["params"].copy()
            if semantic_context:
                enriched_params["semantic_understanding"] = {
                    "intent": semantic_context.intent,
                    "concepts": semantic_context.identified_concepts,
                    "confidence": semantic_context.confidence,
                    "temporal_context": semantic_context.temporal_context,
                    "severity_indicators": semantic_context.severity_indicators
                }

            # Create plan entry with semantic enrichment
            plan_entry = {
                "agent": action["agent"],
                "action": action["action"],
                "params": enriched_params,
                "inputs": [flow["data"] for flow in input_flows],
                "outputs": [flow["data"] for flow in output_flows]
            }

            # Add semantic priority if available
            if semantic_context and semantic_context.confidence > 0.8:
                plan_entry["priority"] = "high"
            elif semantic_context and semantic_context.confidence < 0.5:
                plan_entry["priority"] = "low"
            else:
                plan_entry["priority"] = "medium"

            plan.append(plan_entry)

            logger.debug(f"Added plan entry for {action['agent']}: {plan_entry}")

        return plan
