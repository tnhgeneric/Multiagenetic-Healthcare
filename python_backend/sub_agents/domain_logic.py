
import requests

class DomainLogic:
    """Executes the core business logic (e.g., disease prediction, journey tracking)."""
    def extract_fhir_data_from_context(self, semantic_context):
        """Extract FHIR data from semantic context instead of making a new call"""
        if not semantic_context:
            return {'symptoms': [], 'severity_level': 'medium'}
            
        try:
            # Extract from patient history in temporal info
            patient_history = semantic_context.get('temporal_info', {}).get('patient_history', {})
            
            if not patient_history:
                return {'symptoms': [], 'severity_level': 'medium'}
                
            # Get previous symptoms and severity
            symptoms = patient_history.get('previous_symptoms', [])
            severity_level = patient_history.get('historical_severity', 'medium')
            
            # Get symptom recurrence info for confidence adjustment
            recurrence = patient_history.get('symptom_recurrence', {})
            severe_count = recurrence.get('severe_count', 0)
            
            # Adjust severity based on recurrence
            if severe_count > 0:
                severity_level = 'high'
            
            return {
                'symptoms': symptoms,
                'severity_level': severity_level
            }
            
        except Exception as e:
            print(f"Error extracting FHIR data from context: {str(e)}")
            return {'symptoms': [], 'severity_level': 'medium'}

    def determine_conditions(self, symptoms, severity_level=None):
        """Helper function to determine possible conditions based on symptoms and severity"""
        print(f"determine_conditions called with symptoms: {symptoms}, severity: {severity_level}")
        conditions = []
        confidence = 0.5

        # Define specific symptom combinations
        symptom_patterns = {
            ('headache', 'nausea'): {
                'low': ['Migraine', 'Tension Headache'],
                'medium': ['Migraine with Aura'],
                'high': ['Severe Migraine', 'Chronic Migraine']
            },
            ('headache', 'fever'): {
                'low': ['Viral Infection'],
                'medium': ['Flu', 'Sinus Infection'],
                'high': ['Meningitis']
            },
            ('nausea', 'stomach pain'): {
                'low': ['Gastritis'],
                'medium': ['Food Poisoning'],
                'high': ['Appendicitis']
            }
        }

        # Common symptom groups and their associated conditions
        symptom_groups = {
            'headache_related': {
                'symptoms': ['headache', 'head pain', 'migraine'],
                'conditions': {
                    'low': ['Tension Headache', 'Mild Migraine'],
                    'medium': ['Migraine', 'Sinus Headache'],
                    'high': ['Severe Migraine', 'Cluster Headache']
                }
            },
            'respiratory': {
                'symptoms': ['cough', 'sore throat', 'runny nose', 'congestion'],
                'conditions': {
                    'low': ['Common Cold'],
                    'medium': ['Flu', 'Bronchitis'],
                    'high': ['Pneumonia', 'COVID-19']
                }
            },
            'gastrointestinal': {
                'symptoms': ['nausea', 'vomiting', 'diarrhea', 'stomach pain'],
                'conditions': {
                    'low': ['Gastritis', 'Food Sensitivity'],
                    'medium': ['Food Poisoning', 'Gastroenteritis'],
                    'high': ['Appendicitis', 'Severe Food Poisoning']
                }
            },
            'fever_related': {
                'symptoms': ['fever', 'chills', 'sweating', 'fatigue'],
                'conditions': {
                    'low': ['Viral Infection', 'Common Cold'],
                    'medium': ['Flu', 'Bacterial Infection'],
                    'high': ['Severe Infection', 'COVID-19']
                }
            }
        }

        # Convert symptoms to lowercase for matching
        symptoms_lower = set(s.lower() for s in symptoms)
        
        # First check for specific symptom combinations
        for symptom_combo, severity_conditions in symptom_patterns.items():
            if all(s in symptoms_lower for s in symptom_combo):
                severity = severity_level or 'medium'
                conditions.extend(severity_conditions[severity])
                confidence = 0.8  # Higher confidence for known symptom patterns
                if severity_level == 'high':
                    confidence = 0.9
        
        # If no combination matches, check individual symptom groups
        if not conditions:
            matched_groups = []
            for group_name, group_data in symptom_groups.items():
                if any(s in symptoms_lower for s in group_data['symptoms']):
                    matched_groups.append(group_name)
                    # Add conditions based on severity
                    severity = severity_level or 'medium'
                    conditions.extend(group_data['conditions'][severity])
            
            # Adjust confidence based on matches
            if matched_groups:
                # More matched groups = higher confidence
                confidence = 0.6 + (len(matched_groups) * 0.1)  # 0.7 for 1 group, 0.8 for 2, etc.
                if severity_level == 'high':
                    confidence += 0.1  # Higher confidence for severe cases
        
        return list(set(conditions)), min(confidence, 0.95)  # Cap confidence at 0.95

    def predict_disease(self, params):
        """Main prediction function that uses FHIR data from semantic context"""
        print(f"Domain Logic received params: {params}")
        
        # Get parameters
        patient_id = params.get('patient_id')
        symptoms = params.get('symptoms', [])
        severity_level = params.get('severity_level', 'medium')
        semantic_context = params.get('semantic_context', {})
        
        print(f"Extracted parameters - patient_id: {patient_id}, symptoms: {symptoms}, severity: {severity_level}")
        
        # Extract FHIR data from semantic context
        if semantic_context:
            fhir_data = self.extract_fhir_data_from_context(semantic_context)
            print(f"Extracted FHIR data from context: {fhir_data}")
            # Combine FHIR symptoms with provided symptoms
            symptoms = list(set(symptoms + fhir_data['symptoms']))
            # Only override severity if FHIR data indicates higher severity
            if fhir_data['severity_level'] == 'high' or (fhir_data['severity_level'] == 'medium' and severity_level == 'low'):
                severity_level = fhir_data['severity_level']
        
        # Ensure we have symptoms to analyze
        if not symptoms:
            return {
                'predicted_diseases': ['Unknown'],
                'confidence': 0.5,
                'symptoms_used': [],
                'severity_level': severity_level
            }

        # Get predictions using the helper function
        predicted_diseases, confidence = self.determine_conditions(symptoms, severity_level)
        
        # If no predictions, return unknown
        if not predicted_diseases:
            return {
                'predicted_diseases': ['Unknown'],
                'confidence': 0.5,
                'symptoms_used': symptoms,
                'severity_level': severity_level
            }
            
        # Return full prediction results
        return {
            'predicted_diseases': predicted_diseases,
            'confidence': confidence,
            'symptoms_used': symptoms,
            'severity_level': severity_level,
            'analysis': {
                'symptom_count': len(symptoms),
                'severity_assessment': severity_level,
                'confidence_factors': {
                    'symptom_diversity': len(set(symptoms)) / 10,  # Normalize to 0-1
                    'severity_weight': 0.7 if severity_level == 'high' else 0.5 if severity_level == 'medium' else 0.3
                }
            }
        }
