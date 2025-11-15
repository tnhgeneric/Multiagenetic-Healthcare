from typing import Dict, List, Optional, Any
import requests
import logging

# Configure logging
logger = logging.getLogger(__name__)

class FHIRConnector:
    """
    Handles FHIR database interactions for symptom analysis
    """
    def __init__(self, fhir_server_url: Optional[str] = None):
        self.fhir_server_url = fhir_server_url or "http://localhost:8004"  # Default FHIR server port
        logger.info(f"FHIR Connector initialized with server URL: {self.fhir_server_url}")
        self.snomed_symptom_map = {
            'headache': '25064002',
            'fever': '386661006',
            'cough': '49727002',
            'nausea': '422587007',
            'fatigue': '84229001',
            'sore throat': '267102003'
        }

    def get_patient_history(self, patient_id: str) -> Dict[str, Any]:
        """
        Retrieve patient's symptom history from FHIR server
        """
        try:
            endpoint = f"{self.fhir_server_url}/Patient/{patient_id}/Observation"
            logger.info(f"Requesting patient history from FHIR endpoint: {endpoint}")
            
            response = requests.get(endpoint)
            logger.info(f"FHIR response status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Successfully retrieved history for patient {patient_id}")
                # Log the actual response data
                logger.info(f"FHIR response data: {data}")
                return data
            elif response.status_code == 404:
                logger.warning(f"Patient {patient_id} not found in FHIR server")
            else:
                logger.error(f"FHIR server error: {response.status_code} - {response.text}")
            return {}
            
        except requests.RequestException as e:
            logger.error(f"Network error accessing FHIR server: {str(e)}")
            return {}
        except Exception as e:
            logger.error(f"Unexpected error fetching patient history: {str(e)}")
            return {}

    def get_standard_symptom_codes(self, symptoms: List[str]) -> Dict[str, str]:
        """
        Convert symptom names to SNOMED CT codes
        """
        return {
            symptom: self.snomed_symptom_map.get(symptom.lower(), '')
            for symptom in symptoms
        }

    def enrich_symptoms(self, symptoms: List[str], patient_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Enrich symptom data with FHIR data if available
        """
        logger.info(f"Enriching symptoms for patient {patient_id}: {symptoms}")
        
        enriched_data = {
            'standard_codes': self.get_standard_symptom_codes(symptoms),
            'historical_context': {},
            'related_conditions': {},
            'has_patient_history': False,
            'symptom_history': [],
            'last_recorded_date': None
        }

        if not patient_id:
            logger.info("No patient ID provided for FHIR enrichment")
            return enriched_data

        patient_history = self.get_patient_history(patient_id)
        if not patient_history:
            logger.info("No patient history found in FHIR")
            return enriched_data

        # Process patient history
        enriched_data['has_patient_history'] = True
        entries = patient_history.get('entry', [])
        logger.info(f"Processing {len(entries)} FHIR entries for patient {patient_id}")

        # Add current symptoms to enriched data
        enriched_data['current_symptoms'] = symptoms
        logger.info(f"Current symptoms being analyzed: {symptoms}")
        
        for entry in entries:
            resource = entry.get('resource', {})
            if resource.get('resourceType') == 'Observation':
                # Extract symptom from coding array
                coding = resource.get('code', {}).get('coding', [])
                symptom = coding[0].get('display') if coding else resource.get('code', {}).get('text', '')
                
                # Extract interpretation/severity
                interpretation = resource.get('interpretation', [{}])[0].get('text', '').lower()
                severity = self._extract_severity(resource)
                
                symptom_record = {
                    'symptom': symptom,
                    'date': resource.get('effectiveDateTime', ''),
                    'severity': severity,
                    'interpretation': interpretation,
                    'value': resource.get('valueQuantity', {}).get('value'),
                    'unit': resource.get('valueQuantity', {}).get('unit')
                }
                
                if symptom_record['symptom']:
                    logger.info(f"Found historical symptom record: {symptom_record}")
                    enriched_data['symptom_history'].append(symptom_record)
                    if not enriched_data['last_recorded_date'] or symptom_record['date'] > enriched_data['last_recorded_date']:
                        enriched_data['last_recorded_date'] = symptom_record['date']
                    
                    # Check if this is one of the current symptoms and track severity
                    if symptom.lower() in [s.lower() for s in symptoms]:
                        logger.info(f"Matched historical symptom {symptom} with current symptoms (severity: {severity})")
                        # Track severity for matching symptoms
                        enriched_data.setdefault('matching_symptoms', []).append({
                            'symptom': symptom,
                            'severity': severity,
                            'date': symptom_record['date']
                        })

        # Extract related conditions
        enriched_data['related_conditions'] = self._extract_related_conditions(patient_history)
        
        return enriched_data

    def _extract_severity(self, resource: Dict[str, Any]) -> str:
        """
        Extract severity from a FHIR resource
        """
        severity = 'unknown'
        interpretation = resource.get('interpretation', [{}])[0].get('text', '').lower()
        if interpretation:
            if interpretation in ['severe', 'critical', 'extreme']:
                severity = 'severe'
            elif interpretation in ['moderate', 'medium']:
                severity = 'moderate'
            elif interpretation in ['mild', 'low']:
                severity = 'mild'
        return severity

    def _extract_related_conditions(self, patient_history: Dict[str, Any]) -> List[str]:
        """
        Extract related conditions from patient history
        """
        conditions = set()
        for entry in patient_history.get('entry', []):
            resource = entry.get('resource', {})
            if resource.get('resourceType') == 'Condition':
                condition = resource.get('code', {}).get('text')
                if condition:
                    conditions.add(condition)
        return list(conditions)

        if patient_id:
            patient_history = self.get_patient_history(patient_id)
            if patient_history:
                # Add historical context
                enriched_data['historical_context'] = {
                    'previous_occurrences': self._extract_previous_occurrences(patient_history, symptoms),
                    'related_symptoms': self._extract_related_symptoms(patient_history, symptoms)
                }

        return enriched_data

    def _extract_previous_occurrences(self, history: Dict[str, Any], current_symptoms: List[str]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Extract previous occurrences of current symptoms from patient history
        """
        occurrences = {}
        for symptom in current_symptoms:
            occurrences[symptom] = []
            if 'entry' in history:
                for entry in history['entry']:
                    if entry.get('resource', {}).get('code', {}).get('coding', [{}])[0].get('display', '').lower() == symptom.lower():
                        occurrences[symptom].append({
                            'date': entry['resource'].get('effectiveDateTime', ''),
                            'severity': entry['resource'].get('interpretation', [{}])[0].get('text', 'unknown')
                        })
        return occurrences

    def _extract_related_symptoms(self, history: Dict[str, Any], current_symptoms: List[str]) -> List[str]:
        """
        Find symptoms that commonly occur together based on patient history
        """
        related_symptoms = set()
        if 'entry' in history:
            # Get dates when current symptoms occurred
            symptom_dates = set()
            for entry in history['entry']:
                symptom = entry.get('resource', {}).get('code', {}).get('coding', [{}])[0].get('display', '').lower()
                if symptom in [s.lower() for s in current_symptoms]:
                    symptom_dates.add(entry['resource'].get('effectiveDateTime', '')[:10])  # Get just the date part

            # Find other symptoms that occurred on the same dates
            for entry in history['entry']:
                entry_date = entry['resource'].get('effectiveDateTime', '')[:10]
                if entry_date in symptom_dates:
                    symptom = entry.get('resource', {}).get('code', {}).get('coding', [{}])[0].get('display', '')
                    if symptom.lower() not in [s.lower() for s in current_symptoms]:
                        related_symptoms.add(symptom)

        return list(related_symptoms)