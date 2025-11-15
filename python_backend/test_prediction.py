import requests
import json

url = 'http://127.0.0.1:8002/predict_disease'
data = {
    "symptoms": ["fever", "cough"],
    "severity_level": "medium",
    "patient_id": "test123"
}

print("\nSending request with data:")
print(json.dumps(data, indent=2))

response = requests.post(url, json=data)
print("\nResponse Status:", response.status_code)
print("\nResponse Headers:")
print(json.dumps(dict(response.headers), indent=2))
print("\nResponse Body:")
print(json.dumps(response.json(), indent=2))