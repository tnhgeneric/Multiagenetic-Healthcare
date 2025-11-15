from typing import Dict, Any, List
import os
import json
from datetime import datetime
from dotenv import load_dotenv
from langchain_google_vertexai import VertexAI
from pydantic import BaseModel, Field
import logging

# Load environment variables
load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

class MCPACLAction(BaseModel):
    agent: str
    action: str
    params: Dict[str, Any]

class MCPACLDataFlow(BaseModel):
    fr: str = Field(alias="from")  # using 'fr' since 'from' is a Python keyword
    to: str
    data: str

class MCPACL(BaseModel):
    agents: List[str]
    workflow: str
    actions: List[MCPACLAction]
    data_flow: List[MCPACLDataFlow]

class LLMService:
    def __init__(self):
        try:
            project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
            if not project_id:
                raise ValueError("GOOGLE_CLOUD_PROJECT environment variable not set")
                
            self.llm = VertexAI(
                project=project_id,
                model_name="gemini-2.5-pro"
            )
            # Define patterns for different query types
            self.journey_patterns = [
                "medication history", "medical history",
                "last visit", "next appointment",
                "doctor visits", "hospital", "treatment",
                "prescription", "diagnosis"
            ]
            logger.info("LLM service initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing LLM service: {str(e)}")
            self.llm = None

    def get_structured_symptoms(self, text: str) -> List[str]:
        """Extract structured symptoms from text using semantic understanding"""
        try:
            if not self.llm:
                return []

            prompt = f"""Analyze this text for medical symptoms and related health information. Consider both explicit and implicit symptoms.

Text: "{text}"

Provide your analysis in this exact JSON format:
{{
    "explicit_symptoms": ["symptom1", "symptom2"],
    "implicit_symptoms": ["inferred_symptom1"],
    "duration_mentions": ["started 2 days ago", "occurs daily"],
    "severity_indicators": ["mild", "severe", etc],
    "contextual_health_info": ["relevant medical history", "medications", etc]
}}

Focus on medical accuracy and completeness."""

            response = self.llm(prompt)
            try:
                # Extract JSON from response
                start_idx = response.find('{')
                end_idx = response.rfind('}') + 1
                if start_idx != -1 and end_idx != -1:
                    analysis = json.loads(response[start_idx:end_idx])
                    
                    # Combine explicit and implicit symptoms
                    all_symptoms = (
                        analysis.get("explicit_symptoms", []) +
                        analysis.get("implicit_symptoms", [])
                    )
                    return [s for s in all_symptoms if s.strip()]
                else:
                    logger.warning("No valid JSON found in symptom analysis response")
                    return []
            except json.JSONDecodeError as e:
                logger.error(f"Error parsing symptom analysis: {str(e)}")
                return []
        except Exception as e:
            logger.error(f"Error extracting symptoms: {str(e)}")
            return []

    def generate_mcp_acl(self, enriched_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate MCP/ACL structure based on semantic understanding"""
        try:
            # Extract prompt and context
            raw_text = enriched_data.get('raw_prompt', '')
            enriched_context = enriched_data.get('enriched_context', {})
            user_id = enriched_context.get('user_id')
            
            if not self.llm:
                raise ValueError("LLM service not initialized")

            # First, check for explicit patient_journey keywords without LLM call
            journey_keywords = ['history', 'journey', 'timeline', 'past', 'appointment', 'treatment', 'medication', 'visit', 'result', 'record', 'medical history', 'health journey']
            is_journey_query = any(keyword in raw_text.lower() for keyword in journey_keywords)
            
            # If clearly a journey query, skip LLM and go directly
            if is_journey_query:
                logger.info("Direct patient_journey detection (no LLM needed)")
                # Extract patient_id from query
                import re
                patient_id = None
                mentioned_patient = None  # Track if user mentioned any patient-like string
                
                patterns = [
                    r'patient\s+(?:id:?\s*)?([a-z]{0,3}\d+)',  # "patient pat1" or "patient id: pat1"
                    r'for\s+(?:patient\s+)?([a-z]{0,3}\d+)',   # "for pat1"
                    r'id:\s*([a-z]{0,3}\d+)',                  # "id: pat1"
                    r'([a-z]{0,3}\d+)(?:\s|$)',                # standalone "pat1" followed by space or end
                    r'\b([a-z]{0,3}\d{1,})\b',                 # word boundary with at least 1 digit
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, raw_text.strip(), re.IGNORECASE)
                    if match:
                        extracted = match.group(1).lower()
                        # Validate it looks like a patient ID (starts with letters, ends with digits, minimum 1 digit)
                        if re.match(r'^[a-z]{0,3}\d{1,}$', extracted):
                            patient_id = extracted
                            logger.info(f"Extracted patient_id: {patient_id}")
                            break
                
                # Also check if user mentioned patient-like strings (even incomplete)
                # Look specifically for patterns that look like patient IDs: pat, p, pat without digits at end of query
                if not patient_id:
                    # Search from end of string backwards to find potential patient identifiers
                    words = raw_text.strip().split()
                    for word in reversed(words):  # Start from end
                        word_lower = word.lower().strip('.,!?;:')
                        # Check if word looks like patient ID prefix (1-3 letters, optional digits)
                        if re.match(r'^[a-z]{1,3}\d*$', word_lower) and len(word_lower) <= 3:
                            # If it's a common word, skip it
                            if word_lower not in ['the', 'and', 'for', 'my', 'show', 'get', 'is', 'are', 'was', 'been', 'have', 'has', 'do', 'does', 'did', 'will', 'can', 'could', 'should', 'would', 'may', 'might', 'must', 'of', 'in', 'on', 'at', 'to', 'by', 'or', 'as', 'with', 'from', 'about', 'history', 'medical', 'patient', 'journey', 'timeline', 'past', 'appointment', 'treatment', 'medication', 'visit', 'result', 'record', 'me', 'you', 'he', 'she', 'we', 'it']:
                                mentioned_patient = word_lower
                                logger.info(f"User mentioned potential patient identifier from end: {mentioned_patient}")
                                break
                
                # Use extracted patient_id, or use mentioned string if it looks like incomplete patient ID
                if not patient_id:
                    if mentioned_patient:
                        # User explicitly mentioned something like "pat" or "pat3" - use it literally
                        patient_id = mentioned_patient
                        logger.info(f"Using mentioned patient identifier: {patient_id}")
                    else:
                        patient_id = user_id or 'pat1'
                        logger.info(f"Using default patient_id: {patient_id}")
                
                mcp = MCPACL(
                    agents=["patient_journey"],
                    workflow="patient_journey_tracking",
                    actions=[
                        MCPACLAction(
                            agent="patient_journey",
                            action="get_journey",
                            params={
                                "patient_id": patient_id,
                                "query_type": "general",
                                "concepts": [],
                                "original_query": raw_text
                            }
                        )
                    ],
                    data_flow=[]
                )
                
                result = mcp.model_dump()
                for flow in result["data_flow"]:
                    if "fr" in flow:
                        flow["from"] = flow.pop("fr")
                return result
            
            # Use Gemini Pro for diagnosis queries (with timeout)
            logger.info("Using LLM for intent analysis")
            prompt = f"""Medical chat query analysis - Be concise!

User: "{raw_text}"

Is this asking about THEIR medical history/past events (patient_journey) or CURRENT symptoms (medical_diagnosis)?

Respond with ONLY this JSON (no explanation):
{{"intent": "patient_journey" or "medical_diagnosis"}}"""

            # Get semantic analysis from LLM with timeout
            import signal
            
            try:
                response = self.llm(prompt)
                logger.info(f"LLM response: {response[:200]}")
            except Exception as e:
                logger.error(f"LLM call error: {str(e)}, defaulting to medical_diagnosis")
                response = '{"intent": "medical_diagnosis"}'
            
            try:
                # Extract JSON from response
                start_idx = response.find('{')
                end_idx = response.rfind('}') + 1
                if start_idx != -1 and end_idx != -1:
                    analysis = json.loads(response[start_idx:end_idx])
                else:
                    raise ValueError("No valid JSON found")
            except json.JSONDecodeError as e:
                logger.error(f"JSON parse error: {str(e)}")
                analysis = {"intent": "medical_diagnosis"}
            
            # Create MCP/ACL structure based on intent
            intent = analysis.get("intent", "medical_diagnosis")
            
            if intent == "patient_journey":
                # Extract patient_id from query
                import re
                patient_id = None
                patterns = [
                    r'patient\s+(?:id:?\s*)?([a-z]{0,3}\d+)',  # "patient pat1"
                    r'for\s+(?:patient\s+)?([a-z]{0,3}\d+)',   # "for pat1"
                    r'id:\s*([a-z]{0,3}\d+)',                  # "id: pat1"
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, raw_text, re.IGNORECASE)
                    if match:
                        patient_id = match.group(1)
                        logger.info(f"Extracted patient_id: {patient_id}")
                        break
                
                # Default to authenticated user or 'pat1'
                if not patient_id:
                    patient_id = user_id or 'pat1'
                    logger.info(f"Using default patient_id: {patient_id}")
                
                mcp = MCPACL(
                    agents=["patient_journey"],
                    workflow="patient_journey_tracking",
                    actions=[
                        MCPACLAction(
                            agent="patient_journey",
                            action="get_journey",
                            params={
                                "patient_id": patient_id,
                                "query_type": "general",
                                "concepts": [],
                                "original_query": raw_text
                            }
                        )
                    ],
                    data_flow=[]
                )
            else:
                mcp = MCPACL(
                    agents=["symptom_analyzer", "disease_prediction"],
                    workflow="medical_diagnosis",
                    actions=[
                        MCPACLAction(
                            agent="symptom_analyzer",
                            action="analyze_symptoms",
                            params={
                                "symptoms_text": raw_text,
                                "concepts": analysis.get("identified_concepts", []),
                                "intent": "medical_diagnosis"
                            }
                        ),
                        MCPACLAction(
                            agent="disease_prediction",
                            action="predict_disease",
                            params={"symptoms": []}  # Will be populated from symptom_analyzer's output
                        )
                    ],
                data_flow=[
                    {
                        "from": "symptom_analyzer",
                        "to": "disease_prediction",
                        "data": "structured_symptoms"
                    }
                ]
            )
            
            # Convert to dict and ensure "from" field is correct
            result = mcp.model_dump()
            for flow in result["data_flow"]:
                # Fix the field name if needed
                if "fr" in flow:
                    flow["from"] = flow.pop("fr")
            
            return result
        except Exception as e:
            logger.error(f"Error generating MCP/ACL: {str(e)}")
            raise

    def validate_mcp_acl_format(self, mcp_acl: Dict[str, Any]) -> bool:
        """Validate MCP/ACL format using Pydantic model"""
        try:
            # Try to parse through Pydantic model
            MCPACL(**mcp_acl)
            
            # Additional validation of action names
            valid_actions = {
                "disease_prediction": ["predict_disease"],
                "symptom_analyzer": ["analyze_symptoms"],
                "patient_journey": ["get_journey", "track_journey", "update_journey"]
            }
            
            for action in mcp_acl["actions"]:
                agent = action["agent"].lower()
                action_name = action["action"]
                if agent in valid_actions and action_name not in valid_actions[agent]:
                    logger.warning(f"Invalid action {action_name} for agent {agent}")
                    return False
            
            return True
        except Exception as e:
            logger.error(f"MCP/ACL validation error: {str(e)}")
            return False