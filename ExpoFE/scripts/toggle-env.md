# Toggling Between Local Development and Preview Build Environments

This guide explains how to toggle between local development and preview build configurations.

## Prerequisites

### Backend Setup

#### Dependencies
Required Python packages:
```txt
fastapi
uvicorn
pydantic
```

Install dependencies:
```powershell
cd python_backend
.\.venv\Scripts\activate
pip install -r requirements.txt
```

#### Starting the Backend
The app requires these backend endpoints:
1. Health Check: `http://192.168.1.25:8001/health`
2. Process Prompt: `http://192.168.1.25:8001/process_prompt`

Start the backend server:
```powershell
cd python_backend
.\.venv\Scripts\activate
uvicorn services.prompt_processor:app --reload --host 0.0.0.0 --port 8000
```

Expected Responses:
- Health Check: `{"status": "healthy"}`
- Process Prompt: Handles POST requests with:
  ```json
  {
    "prompt": "string",
    "user_id": "string",
    "session_id": "string",
    "workflow": "string"
  }
  ```

### Common Backend Errors
If you see:
```
LOG  [Backend Config] Resolved backend URL: http://192.168.1.25:8001
ERROR  Network Error Details: {"code": "ERR_BAD_REQUEST", "status": 404}
LOG  Health check response: {"status":"healthy"}
```
This means:
- Backend server is running (health check passes)
- `/process_prompt` endpoint is not found (404)
- Check if the backend server has the correct routes configured

### Expo Go Version
This project uses Expo SDK 49. You need the compatible version of Expo Go:
1. Download from: https://expo.dev/go?sdkVersion=49&platform=android&device=true
2. Uninstall any existing Expo Go app from your device
3. Install the downloaded version for SDK 49

If you see this error:
```
ERROR  Project is incompatible with this version of Expo Go
• The installed version of Expo Go is for SDK 54.
• The project you uses SDK 49.
```
Follow the steps above to install the correct Expo Go version.

## Quick Start

### For Local Development with Expo Go:
1. Remove development client:
```bash
npm uninstall expo-dev-client
```
2. Toggle configuration:
```bash
.\scripts\toggle-config.ps1 -Mode local
```

### For Preview Build:
1. Reinstall development client:
```bash
npm install expo-dev-client@~2.4.11
```
2. Toggle configuration:
```bash
.\scripts\toggle-config.ps1 -Mode preview
```

## Configuration Files Affected

### 1. app.json
#### Preview Build Configuration:
```json
{
  "expo": {
    "extra": {
      "backendUrl": "http://192.168.1.25:8001",
      "eas": {
        "projectId": "02f6bd36-17ba-45cd-bc53-09ee53642672"
      }
    }
  }
}
```

#### Local Development Configuration:
```json
{
  "expo": {
    "extra": {
      "backendUrl": "http://192.168.1.25:8001"
    }
  }
}
```

### 2. app.config.js
#### Preview Build Configuration:
```javascript
module.exports = {
  expo: {
    extra: {
      EXPO_PUBLIC_BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
      backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.25:8001/health',
      eas: {
        projectId: '84aac15a-f152-4b01-b164-c2f7488e6948'
      }
    }
  }
}
```

#### Local Development Configuration:
```javascript
module.exports = {
  expo: {
    extra: {
      EXPO_PUBLIC_BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
      backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.25:8001/health'
      // EAS config commented out for local development
      // eas: {
      //   projectId: '84aac15a-f152-4b01-b164-c2f7488e6948'
      // }
    }
  }
}
```

## Using the Toggle Script

The script is located at `ExpoFE/scripts/toggle-config.ps1`.

### Commands

1. Switch to Local Development:
```powershell
cd ExpoFE
.\scripts\toggle-config.ps1 -Mode local
```
After switching to local mode:
```powershell
npx expo start
```

2. Switch to Preview Build:
```powershell
cd ExpoFE
.\scripts\toggle-config.ps1 -Mode preview
```
After switching to preview mode:
```powershell
eas build --profile preview --platform android
```

## Script Features

- Creates automatic backups of configuration files
- Safely modifies both `app.json` and `app.config.js`
- Includes error handling with automatic backup restoration
- Cleans Metro cache after switching
- Provides clear instructions after switching

## Backup Files

The script automatically creates these backup files on first run:
- `app.json.backup`
- `app.config.js.backup`

These backups are used for recovery if any errors occur during the configuration switch.

## Common Issues

### Multiple Bundler Sessions
If you see messages like:
```
Android Bundling complete 62ms
Android Bundling complete 102ms
    at ContextNavigator...
    at ExpoRoot...
```
And/or see an error screen but the app works after rescanning the QR code, this is normal behavior with Expo Router. This happens because:
1. The initial bundle loads
2. Hot reloading tries to set up
3. The app might show an error briefly
4. Rescanning the QR code starts a fresh session

This is not an actual error and you can:
- Ignore the multiple bundling messages
- Rescan QR code if you see an error screen
- The app should work normally after a fresh scan

#### Understanding the Component Stack Trace
When you see a stack trace like this:
```
at ContextNavigator (.../expo-router/entry.bundle/...)
at ExpoRoot (...)
at App
at withDevTools(App)
at ErrorToastContainer
at ErrorOverlay
at RCTView
at View
at AppContainer
at main(RootComponent)
```
This shows the React component hierarchy when initializing the app:
1. `ContextNavigator`, `ExpoRoot`: Expo Router setup components
2. `App`: Your main application component
3. `withDevTools`: Development tools wrapper
4. `ErrorToastContainer`, `ErrorOverlay`: Error handling components
5. `RCTView`, `View`: React Native basic view components
6. `AppContainer`: React Native root container
7. `main(RootComponent)`: Entry point initialization

The numbers after the colons (e.g., `:155093:24`) are line and column numbers in the bundled code. These can be ignored during development as they refer to the bundled JavaScript rather than your source code.

### Development Client vs Expo Go

If you see this URL format:
```
Metro waiting on exp+expofe://expo-development-client/?url=http%3A%2F%2F192.168.1.25%3A8081
```
Instead of:
```
Metro waiting on exp://192.168.1.25:8081
```

This means the development client is still active. Follow the "Return to Local Development" steps above.

## Troubleshooting

If you encounter issues:

1. Clear Metro cache manually:
```powershell
Remove-Item -Path $env:TEMP\metro-* -Recurse -Force -ErrorAction SilentlyContinue
```

2. Restore from backups manually:
```powershell
Copy-Item .\app.json.backup .\app.json -Force
Copy-Item .\app.config.js.backup .\app.config.js -Force
```

3. Verify the configuration:
- Check that `app.json` and `app.config.js` have the correct configuration for your intended mode
- Ensure no syntax errors were introduced during the switch

## Development Client Configuration

### app.config.js Development Client Settings
For preview builds, add:
```javascript
    // Add proxy settings for development
    developmentClient: {
      proxyEnabled: true
    },
```

For local development, remove this section.

### package.json Dependencies
Preview build requires:
```json
{
  "dependencies": {
    "expo-dev-client": "~2.4.11"
  }
}
```

Local development: Remove this dependency.

## Development Workflow

1. Start with Local Development:
```powershell
# Remove development client
npm uninstall expo-dev-client

# Switch configuration
.\scripts\toggle-config.ps1 -Mode local

# Start Expo
npx expo start
```

2. When Ready for Preview Build:
```powershell
# Install development client
npm install expo-dev-client@~2.4.11

# Switch configuration
.\scripts\toggle-config.ps1 -Mode preview

# Build preview
eas build --profile preview --platform android
```

3. Return to Local Development:
```powershell
# Remove development client
npm uninstall expo-dev-client

# Switch configuration
.\scripts\toggle-config.ps1 -Mode local

# Start Expo
npx expo start
```

## Project IDs Reference

Keep track of these project IDs:
- Preview Build ID in app.json: `02f6bd36-17ba-45cd-bc53-09ee53642672`
- Preview Build ID in app.config.js: `84aac15a-f152-4b01-b164-c2f7488e6948`

These IDs are required for preview builds but should be removed/commented out for local development.