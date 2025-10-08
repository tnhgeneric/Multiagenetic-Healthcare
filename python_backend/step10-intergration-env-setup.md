# Multi-Agentic Healthcare System Integration Guide

This guide details the configuration and setup steps needed to run both the frontend (Expo) and backend (Python FastAPI) components of the Multi-Agentic Healthcare System.

## System Architecture Overview

The system consists of three main components:
1. Expo Frontend (React Native)
2. FastAPI Backend (Orchestration Agent)
3. Mock LLM Service (Development Environment)

## 1. Backend Configuration

### 1.1 Python Environment Setup

Location: `python_backend/`

```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 1.2 LLM Mock Service Configuration

File: `python_backend/llm_mock.py`
- Default port: 9000
- No configuration changes needed unless using a different port
- If port is changed, update `LLM_ENDPOINT_URL` in orchestration_agent/main.py

### 1.3 FastAPI Orchestration Agent Configuration

File: `python_backend/orchestration_agent/main.py`
```python
# Update if mock LLM port was changed
LLM_ENDPOINT_URL = os.getenv("LLM_ENDPOINT_URL", "http://localhost:9000/llm")
```

## 2. Frontend Configuration

### 2.1 Expo Configuration

Location: `ExpoFE/`

1. **Backend URL Configuration**  
   File: `app.json`
   ```json
   {
     "expo": {
       "extra": {
         "backendUrl": "http://YOUR_PC_IP:8000"  // Replace YOUR_PC_IP with your machine's IP
       }
     }
   }
   ```

2. **Backend Config Override**  
   File: `config/backendConfig.ts`
   ```typescript
   // Will use backendUrl from app.json or fall back to this IP
   export const BACKEND_BASE_URL: string = envBackendUrl() || 'http://YOUR_PC_IP:8000';
   ```

## 3. Network Configuration

### 3.1 Find Your PC's IP Address

```powershell
# Run ipconfig and look for IPv4 Address under your active network adapter
ipconfig
```

Common locations:
- Wi-Fi adapter: "Wireless LAN adapter Wi-Fi"
- Ethernet adapter: "Ethernet adapter Ethernet"

### 3.2 Windows Firewall Configuration

Run these commands to allow incoming connections:

```powershell
# Allow FastAPI backend (port 8000)
New-NetFirewallRule -DisplayName "Allow Python FastAPI 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow

# Allow Mock LLM service (port 9000)
New-NetFirewallRule -DisplayName "Allow Python LLM Mock 9000" -Direction Inbound -LocalPort 9000 -Protocol TCP -Action Allow
```

## 4. Starting the Services

### 4.1 Start Mock LLM Service (Terminal 1)

```powershell
cd python_backend
.\.venv\Scripts\Activate.ps1
uvicorn llm_mock:app --host 0.0.0.0 --port 9000 --reload
```

### 4.2 Start FastAPI Backend (Terminal 2)

```powershell
cd python_backend
.\.venv\Scripts\Activate.ps1
uvicorn orchestration_agent.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4.3 Start Expo Frontend (Terminal 3)

```powershell
cd ExpoFE
npm install  # Only needed first time or when dependencies change
npx expo start
```

## 5. Verifying the Setup

### 5.1 Backend Health Check

Test these URLs in your browser:
1. FastAPI backend: `http://YOUR_PC_IP:8000/orchestrate`
2. Mock LLM service: `http://YOUR_PC_IP:9000/llm`

### 5.2 Frontend Integration Test

1. Open the Expo app on your device
2. Navigate to the chat screen
3. Send a test message
4. Try the disease prediction feature

### 5.3 Common Issues

1. **"Cannot reach backend" error:**
   - Verify IP address is correct in app.json
   - Check if backend is running
   - Verify firewall rules are in place

2. **"Connection refused" error:**
   - Ensure correct ports are being used
   - Check if another service is using the same port

3. **Mock LLM connection issues:**
   - Verify both services are running
   - Check if URLs are configured correctly

## 6. Development Notes

### 6.1 Port Usage
- FastAPI Backend: 8000
- Mock LLM Service: 9000
- Do not use these ports for other services

### 6.2 Configuration Files Summary
1. `python_backend/orchestration_agent/main.py`: LLM endpoint configuration
2. `ExpoFE/app.json`: Backend URL configuration
3. `ExpoFE/config/backendConfig.ts`: Backend URL fallback

### 6.3 Testing Changes
After changing any configuration:
1. Restart the affected service
2. Clear Expo cache if needed: `npx expo start -c`
3. Verify connectivity in the app