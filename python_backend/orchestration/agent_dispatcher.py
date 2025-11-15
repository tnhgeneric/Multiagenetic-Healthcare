
import requests
from typing import List, Dict, Any, Optional
import logging

# Configure logging
logger = logging.getLogger(__name__)

class AgentDispatcher:
    """
    Dispatches tasks to sub-agents with semantic context awareness.
    Handles MCP/ACL messages and maintains semantic understanding throughout the flow.
    """
    def __init__(self):
        # Agent endpoints
        # Use the same IP as the frontend configuration
        host = "192.168.1.25"  # Your machine's IP address
        self.disease_prediction_url = f"http://{host}:8002/predict_disease"
        self.symptom_analyzer_url = f"http://{host}:8003/analyze_symptoms"
        self.patient_journey_url = f"http://{host}:8005/patient_journey"
        
    def enrich_request_with_semantics(self, params: Dict[str, Any], task: Dict[str, Any]) -> Dict[str, Any]:
        """Enriches the request parameters with semantic understanding"""
        enriched_params = params.copy()
        
        # Add semantic context if available
        if "semantic_understanding" in task.get("params", {}):
            enriched_params["semantic_context"] = task["params"]["semantic_understanding"]
            
        # Add task priority if available
        if "priority" in task:
            enriched_params["priority"] = task["priority"]
            
        return enriched_params

    def dispatch(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        results = []
        intermediate_results = {}  # Store results for data flow between agents
        semantic_context = {}  # Store semantic context for cross-agent sharing
        
        for task in tasks:
            agent = task.get('agent')
            action = task.get('action')
            params = task.get('params', {})
            
            try:
                if agent.lower() == 'patient_journey':
                    if action in ['get_journey', 'update_journey']:
                        # First, preserve patient_id from params
                        patient_id = params.get('patient_id', 'pat1')
                        
                        # Enrich request with semantic context
                        enriched_params = self.enrich_request_with_semantics(params, task)
                        
                        # Ensure patient_id is always set
                        enriched_params['patient_id'] = patient_id
                        
                        # Add default context
                        enriched_params['context'] = {
                            'hospital': 'City General Hospital',
                            'primary_doctor': 'Dr. Jane Smith'
                        }
                        
                        logger.info(f"Dispatching to patient_journey with params: {enriched_params}")
                        response = requests.post(self.patient_journey_url, json=enriched_params)
                        if response.status_code == 200:
                            response_data = response.json()
                            # Extract the actual result from the response
                            # The agent returns {"result": {...}, "error": null}
                            actual_result = response_data.get('result', {})
                            
                            # If there's an error, wrap it in result so frontend can display it
                            if response_data.get('error'):
                                actual_result = {'error': response_data.get('error')}
                            
                            results.append({
                                'agent': agent,
                                'result': actual_result,
                                'error': response_data.get('error')
                            })
                            # Store journey info in semantic context for other agents
                            semantic_context['patient_journey'] = actual_result
                        else:
                            logger.error(f"Patient Journey agent error: {response.text}")
                            results.append({
                                'agent': agent,
                                'error': f"Patient Journey agent error: {response.text}"
                            })

                elif agent.lower() == 'symptom_analyzer':
                    if action == 'analyze_symptoms':
                        # Enrich request with semantic context
                        enriched_params = self.enrich_request_with_semantics(
                            {'symptoms_text': params.get('symptoms_text', '')},
                            task
                        )
                        
                        logger.info(f"Dispatching to symptom analyzer with semantic context")
                        logger.debug(f"Enriched params: {enriched_params}")
                        
                        response = requests.post(
                            self.symptom_analyzer_url,
                            json=enriched_params
                        )
                        response.raise_for_status()
                        result = response.json()
                        
                        # Store the identified symptoms and semantic context
                        result_data = result.get('result', {})
                        if result_data.get('identified_symptoms'):
                            intermediate_results['structured_symptoms'] = result_data['identified_symptoms']
                            intermediate_results['severity_level'] = result_data.get('severity_level', 'medium')
                            # Store patient ID if available (either from result or top-level response)
                            intermediate_results['patient_id'] = result_data.get('patient_id') or result.get('patient_id')
                            # Preserve semantic understanding for next agent
                            semantic_context['symptom_analysis'] = result_data.get('semantic_analysis', {})
                        
                        results.append({
                            'agent': agent,
                            'result': result.get('result'),
                            'error': result.get('error'),
                            'semantic_context': semantic_context.get('symptom_analysis', {}),
                            'patient_id': intermediate_results.get('patient_id')  # Include patient ID
                        })
                    else:
                        results.append({
                            'agent': agent,
                            'error': f'Unknown action for symptom_analyzer: {action}'
                        })
                
                elif agent.lower() == 'disease_prediction':
                    if action == 'predict_disease':
                        request_params = {}
                        
                        # Get patient ID from intermediate results or params
                        if 'patient_id' in intermediate_results:
                            request_params['patient_id'] = intermediate_results['patient_id']
                        elif 'patient_id' in params:
                            request_params['patient_id'] = params['patient_id']
                            
                        # Log patient ID handling
                        logger.info(f"Using patient ID for disease prediction: {request_params.get('patient_id')}")
                        
                        # If we have symptoms from analyzer or params, use them
                        if 'structured_symptoms' in intermediate_results:
                            request_params['symptoms'] = intermediate_results['structured_symptoms']
                            request_params['severity_level'] = intermediate_results.get('severity_level', 'medium')
                        elif 'symptoms' in params:
                            request_params['symptoms'] = params['symptoms']
                        
                        # Add any semantic context
                        if semantic_context.get('symptom_analysis'):
                            request_params['semantic_context'] = semantic_context['symptom_analysis']
                            
                        logger.info(f"Dispatching to disease prediction with params: {request_params}")
                        
                        response = requests.post(
                            self.disease_prediction_url,
                            json=request_params
                        )
                        response.raise_for_status()
                        result = response.json()

                        # Include patient_id in the result structure
                        prediction_result = result.get('result', {})
                        if request_params.get('patient_id'):
                            prediction_result['patient_id'] = request_params['patient_id']
                            
                        results.append({
                            'agent': agent,
                            'result': prediction_result,
                            'error': result.get('error'),
                            'patient_id': request_params.get('patient_id')  # Add at top level too
                        })
                    else:
                        results.append({
                            'agent': agent,
                            'error': f'Unknown action for disease_prediction: {action}'
                        })
                
                elif agent.lower() == 'patient_journey':
                    if action == 'track_journey':
                        # Format request for patient journey agent
                        journey_request = {
                            'prompt': params.get('prompt', ''),
                            'patient_id': params.get('patient_id', ''),
                            'symptoms': params.get('symptoms', [])  # Default to empty list if no symptoms
                        }
                        response = requests.post(
                            self.patient_journey_url,
                            json=journey_request
                        )
                        response.raise_for_status()
                        result = response.json()
                        results.append({
                            'agent': agent,
                            'result': result.get('result'),
                            'error': result.get('error')
                        })
                    else:
                        results.append({
                            'agent': agent,
                            'error': f'Unknown action for patient_journey: {action}'
                        })
                
                else:
                    results.append({
                        'agent': agent,
                        'result': None,
                        'error': f'No handler implemented for agent: {agent}'
                    })
            except Exception as e:
                results.append({
                    'agent': agent,
                    'result': None,
                    'error': f'Error dispatching to {agent}: {str(e)}'
                })
        return results
