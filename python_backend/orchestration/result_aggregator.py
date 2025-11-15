class ResultAggregator:
    """
    Collects and processes outputs from sub-agents for the final response.
    Manages data flow between agents and aggregates final results.
    """
    def __init__(self):
        self.intermediate_results: Dict[str, Any] = {}
        
    def _process_symptom_analyzer_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Process symptom analyzer results and prepare for disease prediction"""
        if not result or 'result' not in result:
            return {}
            
        symptom_data = result['result']
        if not symptom_data:
            return {}
            
        return {
            'identified_symptoms': symptom_data.get('identified_symptoms', []),
            'severity_level': symptom_data.get('severity_level', 'unknown'),
            'confidence': symptom_data.get('confidence', 0.0)
        }

    def _process_disease_prediction_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Process disease prediction results"""
        if not result or 'result' not in result:
            return {}
            
        prediction_data = result['result']
        if not prediction_data:
            return {}
            
        return {
            'predicted_diseases': prediction_data.get('predicted_diseases', []),
            'confidence': prediction_data.get('confidence', 0.0),
            'severity_assessment': prediction_data.get('severity_assessment', 'unknown')
        }

    def aggregate(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Aggregate results from multiple agents and manage data flow.
        Ensures proper data passing between symptom analyzer and disease prediction.
        """
        if not results:
            return []

        logger.info(f"Aggregating results from {len(results)} agents")
        aggregated_results = []
        
        # First pass: collect symptom analyzer results
        for result in results:
            agent = result.get('agent', '')
            if agent == 'symptom_analyzer':
                processed_result = self._process_symptom_analyzer_result(result)
                if processed_result:
                    # Store for disease prediction
                    self.intermediate_results['symptoms'] = processed_result['identified_symptoms']
                    aggregated_results.append({
                        'agent': 'symptom_analyzer',
                        'result': processed_result
                    })
                    logger.info(f"Processed symptom analyzer result: {processed_result}")

        # Second pass: process disease prediction with symptom data
        for result in results:
            agent = result.get('agent', '')
            if agent == 'disease_prediction':
                # Ensure disease prediction has access to symptom data
                if 'symptoms' in self.intermediate_results:
                    if 'result' not in result:
                        result['result'] = {}
                    result['result']['input_symptoms'] = self.intermediate_results['symptoms']
                
                processed_result = self._process_disease_prediction_result(result)
                if processed_result:
                    aggregated_results.append({
                        'agent': 'disease_prediction',
                        'result': processed_result
                    })
                    logger.info(f"Processed disease prediction result: {processed_result}")

        logger.info(f"Final aggregated results: {aggregated_results}")
        return aggregated_results

    def check_completion(self, results: List[Dict[str, Any]]) -> bool:
        """
        Check if all required agents have completed their tasks
        """
        if not results:
            return False
            
        has_symptom_results = any(
            r.get('agent') == 'symptom_analyzer' and 
            r.get('result', {}).get('identified_symptoms', [])
            for r in results
        )
        
        has_prediction_results = any(
            r.get('agent') == 'disease_prediction' and 
            r.get('result', {}).get('predicted_diseases', [])
            for r in results
        )
        
        return has_symptom_results and has_prediction_results
