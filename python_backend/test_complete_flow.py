import requests
import json

def test_flow():
    print("\n1. Testing Symptom Analyzer...")
    symptom_analyzer_url = 'http://127.0.0.1:8003/analyze_symptoms'
    symptom_data = {
        "symptoms_text": "I have fever and cough since yesterday, feeling quite sick",
        "priority": "medium"
    }
    
    print("\nSending to Symptom Analyzer:", json.dumps(symptom_data, indent=2))
    symptom_response = requests.post(symptom_analyzer_url, json=symptom_data)
    print("\nSymptom Analyzer Response:", json.dumps(symptom_response.json(), indent=2))
    
    if symptom_response.status_code == 200 and symptom_response.json().get('result'):
        print("\n2. Testing Disease Prediction...")
        # Extract symptoms from analyzer response
        analyzer_result = symptom_response.json()['result']
        
        disease_prediction_url = 'http://127.0.0.1:8002/predict_disease'
        prediction_data = {
            "symptoms": analyzer_result.get('identified_symptoms', []),
            "severity_level": analyzer_result.get('severity_level', 'medium')
        }
        
        print("\nSending to Disease Prediction:", json.dumps(prediction_data, indent=2))
        prediction_response = requests.post(disease_prediction_url, json=prediction_data)
        print("\nDisease Prediction Response:", json.dumps(prediction_response.json(), indent=2))
    else:
        print("\nFailed to get symptoms from analyzer, skipping disease prediction")

if __name__ == "__main__":
    test_flow()