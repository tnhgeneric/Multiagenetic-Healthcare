import requests
import json
import time

def test_mcp_flow():
    # 1. Send to Prompt Processor (8000)
    print("\n1. Testing Prompt Processor...")
    prompt_data = {
        "prompt": "I have fever and cough",
        "user_id": "test",
        "session_id": "test123",
        "workflow": "symptom_analysis"
    }
    
    print("\nSending to Prompt Processor:", json.dumps(prompt_data, indent=2))
    try:
        prompt_response = requests.post('http://127.0.0.1:8000/process_prompt', json=prompt_data)
        print("\nPrompt Processor Response Status:", prompt_response.status_code)
        print("Response:", json.dumps(prompt_response.json(), indent=2))
        
        # 2. Check MCP/ACL structure
        if prompt_response.json().get('mcp_acl'):
            print("\n2. MCP/ACL structure received, checking orchestration...")
            orchestration_data = {'mcp_acl': prompt_response.json()['mcp_acl']}
            print("\nSending to Orchestration:", json.dumps(orchestration_data, indent=2))
            
            try:
                orchestration_response = requests.post('http://127.0.0.1:8001/orchestrate', json=orchestration_data)
                print("\nOrchestration Response Status:", orchestration_response.status_code)
                print("Response:", json.dumps(orchestration_response.json(), indent=2))
                
                # 3. Check results from agents
                results = orchestration_response.json().get('results', [])
                if results:
                    print("\n3. Results from agents:")
                    for result in results:
                        print(f"\nAgent: {result['agent']}")
                        print("Result:", json.dumps(result['result'], indent=2))
            except Exception as e:
                print("\nError with orchestration:", str(e))
        else:
            print("\nNo MCP/ACL structure in prompt processor response")
            
    except Exception as e:
        print("\nError with prompt processor:", str(e))

if __name__ == "__main__":
    test_mcp_flow()