# Building with EAS (Expo Application Services)

## Table of Contents
1. [Understanding Dependencies](#understanding-dependencies-in-mobile-app-development)
2. [EAS Setup Process](#eas-setup-process)
3. [Build Configuration](#build-configuration)
4. [Network Configuration](#network-configuration)
5. [Build Types and Profiles](#build-types-and-profiles)
6. [Development Build Setup](#development-build-setup)
7. [Troubleshooting](#troubleshooting)

## Network Configuration
When setting up the app on a new development machine, follow these steps:

### 1. Configure Network Security (Required for HTTP Traffic)
For development builds that need to access HTTP backend:

1. Install required plugin:
```bash
npx expo install expo-build-properties
```

2. Update `app.config.js`:
```javascript
module.exports = {
  expo: {
    // ... other config
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
            networkSecurityConfig: "network_security_config"
          }
        }
      ],
      // ... other plugins like expo-router
    ]
  }
}
```

3. Create/Update network security config file:
Path: `android/app/src/main/res/xml/network_security_config.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.1.25</domain>
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
</network-security-config>
```

### 2. Backend URL Configuration
1. In `app.config.js`, set the backend URL:
```javascript
module.exports = {
  expo: {
    // ... other config
    extra: {
      EXPO_PUBLIC_BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
      backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.25:8001/health',
    }
  }
}
```

2. Update IP address in both:
   - `network_security_config.xml`
   - `app.config.js` fallback URL
   to match your development machine's IP address

### 3. Health Check Response Format
The backend health endpoint (`/health`) should return:
```json
{
  "status": "healthy",
  "service": "orchestration_agent"
}
```

## Understanding Dependencies in Mobile App Development

### Production Dependencies (`dependencies`)
These are packages required for the application to run in production (when users are using your app):

```json
"dependencies": {
  "react-native": "^0.81.4",     // Core framework for mobile app
  "axios": "^1.10.0",            // For API calls
  "@expo/vector-icons": "^14.1.0" // UI icons package
}
```

- Included in the final app bundle
- Required for the app to function
- Users need these when running the app
- Examples: React, React Native, UI components, API libraries

### Development Dependencies (`devDependencies`)
These are packages only needed during development, testing, or building:

```json
"devDependencies": {
  "eas-cli": "x.x.x",           // For building the app
  "@babel/core": "^7.25.2"      // For code compilation
}
```

- Not included in the final app bundle
- Only used by developers
- Used for building, testing, and development
- Examples: build tools, testing libraries, compilers

## Why EAS CLI is a Development Dependency

EAS CLI is categorized as a development dependency because:
1. It's a build tool used only during development
2. It's not required when users run your app
3. It helps create the production build but isn't part of it
4. It keeps your production bundle smaller and optimized

## Build Process Overview

When building your app for distribution:
1. All `dependencies` are included in the app bundle
2. All `devDependencies` are excluded from the bundle
3. The resulting app is optimized for end users
4. Users get only what they need to run the app

### EAS Build Environment
When you run an EAS build:
1. Build happens on Expo's cloud servers
2. Uses a clean, isolated environment for each build
3. Logs are stored in `/home/expo/.npm/_logs/` on Expo's servers
4. Build artifacts are uploaded to your Expo account

### Accessing Build Information
Since the builds run on Expo's secure servers, you can access build information through:

1. EAS CLI Commands:
```bash
# View build logs
eas build:logs

# List all builds
eas build:list

# View specific build details
eas build:view

# View logs of a specific build
eas build:logs --id YOUR_BUILD_ID
```

2. Expo Dashboard (Web Interface):
- Visit: https://expo.dev
- Navigate to your project
- Click "Builds" tab
- Select specific build
- Access:
  - Build logs
  - Error reports
  - Build artifacts
  - Configuration details

3. Build Artifacts Access:
- Download APK/AAB files
- View build configuration
- Check build status

## Troubleshooting

### Connection Warning in App
If you see "The server responded but did not indicate a healthy state":

1. Check Backend Response:
```powershell
Invoke-WebRequest -Uri "http://YOUR_IP:8001/health" -Method GET -UseBasicParsing
```
Verify it returns:
```json
{"status":"healthy","service":"orchestration_agent"}
```

2. Verify Network Security Config:
- Check `network_security_config.xml` includes your IP
- Confirm `expo-build-properties` plugin is installed
- Verify `app.config.js` has correct plugin configuration

3. Rebuild Required After Changes:
```bash
eas build --profile preview --platform android --clear-cache
```

### Common Issues

1. HTTP Traffic Blocked:
- Symptom: Connection fails despite backend running
- Fix: Verify `expo-build-properties` plugin configuration and network security config

2. Wrong IP Address:
- Symptom: Connection timeout
- Fix: Update IP in both `network_security_config.xml` and `app.config.js`

3. Build Installation:
- Symptom: App not installing from QR code
- Fix: Download and install APK directly from Expo website

4. Backend Not Responding:
- Symptom: Connection failed alert
- Fix: Ensure backend is running and accessible:
```powershell
curl http://YOUR_IP:8001/health
```

### Plugin Dependencies
If you see npm audit warnings, safely update Expo packages:
```bash
npx expo install expo expo-router expo-build-properties
```

Remember to rebuild after any configuration changes.
- Access error logs

Understanding Build Logs:
- Format: `YYYY-MM-DDTHH_MM_SS_MSSZ-type.txt`
- Location: On Expo's build servers
- Access: Through EAS CLI or Expo dashboard
- Common log types:
  - `eresolve-report.txt`: Dependency resolution issues
  - `build-error.txt`: Build failure details
  - `debug.txt`: Detailed build process logs

## Installation Methods

You can install EAS CLI in two ways:

1. As a project development dependency:
```bash
npm install --save-dev eas-cli
```

2. As a global tool:
```bash
npm install -g eas-cli
```

The global installation is often preferred as it:
- Makes the `eas` command available system-wide
- Allows you to use EAS CLI with multiple projects
- Prevents version conflicts between projects

## EAS Setup Process

### 1. Prerequisites
- Node.js installed (version 16 or higher)
- Expo CLI installed globally
- Expo account (create one at https://expo.dev/signup)
- For iOS builds: Apple Developer account
- For Android builds: Google Play Console account

### 2. Initial Setup
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Verify login status
eas whoami

# Initialize EAS project
eas project:init

# Initialize EAS build configuration
eas build:configure
```

## Build Configuration

### 1. eas.json Configuration
Create or update your `eas.json` file:

```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      },
      "ios": {
        "buildConfiguration": "Debug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### 2. app.json Configuration
Update your `app.json` file:

```json
{
  "expo": {
    "name": "CareFlow",
    "slug": "careflow",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#e9d6f7"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.careflow"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#e9d6f7"
      },
      "package": "com.tnhgeneric.ExpoFE"
    }
  }
}
```

## Development Build Setup

### 1. Install Required Dependencies
Development builds require specific package versions that we found to work together:

```bash
# Install core dependencies
npm install expo-dev-client --legacy-peer-deps
npm install expo-router@2.0.0
npm install react-native-reanimated@~3.3.0 react-native-screens@~3.22.0 react-native-safe-area-context@4.6.3
```

These specific versions resolved compatibility issues between:
- expo-router and expo-constants
- React Navigation dependencies
- Reanimated and other UI components

### 2. Backend Configuration
For local development, we successfully configured the backend connection:

1. Update app.json with local backend URL:
```json
{
  "expo": {
    "extra": {
      "backendUrl": "http://192.168.1.25:8001"
    },
    "android": {
      "usesCleartextTraffic": true
    }
  }
}
```

2. Ensure backend services are running:
- Orchestration Agent on port 8001
- Symptom Analyzer on port 8003
- Other required services on respective ports

3. Verify backend health:
```bash
# Test health endpoint
curl http://192.168.1.25:8001/health
```

### 2. Development Build Configuration
Ensure your eas.json has the development configuration:
- `developmentClient: true` enables development features
- `distribution: "internal"` for testing builds
- Proper gradle configuration for Android

### 3. Android Keystore Setup
When building for Android, EAS will prompt to generate a keystore:
```bash
? Generate a new Android Keystore? » (Y/n)
```

The Android Keystore is crucial because:
- Required for signing all Android apps
- Proves you are the legitimate app developer
- Required for Play Store publishing
- Must be the same for all app updates

Important Notes:
- EAS securely stores the keystore (.jks file) on their servers
- The same keystore is used for all future builds
- If you lose access to your keystore:
  - You cannot update your existing app
  - You'll need to publish a new app with a new package name
  - Users will need to manually install the new app

Understanding .jks Files:
- .jks (Java KeyStore) is a secure container for your app's digital certificates
- Contains both private key and public certificate
- Protected by two passwords:
  - Keystore password: Protects the .jks file itself
  - Key password: Protects the private key inside
- When using EAS:
  - EAS generates and manages the .jks file
  - Handles signing process automatically
  - Stores credentials securely
  - No need for manual keystore management

## Build Types and Profiles

### Development Build
- For testing on physical devices
- Includes development client
- Requires running Metro bundler
- Needs constant connection to development server
- Real-time code updates possible

Required Running Services:
```bash
# 1. Start backend servers
uvicorn orchestrate.main:app --host 0.0.0.0 --port 8001
uvicorn agents.symptom_analyzer.main:app --port 8003

# 2. Start Metro bundler (required for dev build)
npx expo start --dev-client

# 3. Build command
eas build --profile development --platform android
```

Development Build Usage:
- Scan QR code to connect
- Requires Metro bundler running
- Need development server active
- Hot reload available

### Preview Build
- For internal testing
- Similar to production but with testing capabilities
- Generates standalone APK for Android
- No development server required
- Direct backend connection

Required Running Services:
```bash
# Only backend servers needed
uvicorn orchestrate.main:app --host 0.0.0.0 --port 8001
uvicorn agents.symptom_analyzer.main:app --port 8003

# Build command
eas build --profile preview --platform android
```

Preview Build Usage:
- Install APK directly
- NO need for Metro bundler
- NO need for `npx expo start`
- NO QR code scanning required
- Works independently like production app
- Connects directly to configured backend URL

Important Backend Notes:
- Backend URL (http://192.168.1.25:8001) must be accessible from device
- Test backend access: Open device browser -> http://192.168.1.25:8001/health
- Device must be on same network as backend server
- usesCleartextTraffic must be true for HTTP connections

### Production Build
- For App Store/Play Store submission
- Fully optimized
- Includes app signing
- Standalone app (no development dependencies)
- Points to production backend URLs

Required Running Services:
```bash
# Only production backend needed
# No local development services required
# Uses configured production URLs
```

Production Build Usage:
- Install from Play Store
- NO development server needed
- NO Metro bundler required
- Completely independent app
- Uses production backend URLs
- Proper SSL/HTTPS required

#### Required Configuration for Production Build

1. Configure app.config.js for Android:
```javascript
// app.config.js
module.exports = {
  expo: {
    name: "CareFlow",
    slug: "careflow",
    version: "1.0.0",
    android: {
      package: "com.tnhgeneric.multiagenetic", // Required for production build
      versionCode: 1, // Increment this for each Play Store release
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#e9d6f7"
      }
    },
    extra: {
      eas: {
        projectId: "02f6bd36-17ba-45cd-bc53-09ee53642672"
      }
    }
  }
};
```

2. Update eas.json with version source configuration:
```json
{
  "cli": {
    "version": ">= 5.9.1",
    "appVersionSource": "remote" // Add this line for version management
  },
  "build": {
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

3. Run production build:
```bash
eas build --profile production --platform android
```

4. Successful Build Output:
- Build ID: c130b944-b1b7-4cd4-8c44-d3d018326170
- Output: Android App Bundle (AAB)
- Location: https://expo.dev/artifacts/eas/pRDt5CU92KZCMmxRxmxgBN.aab

5. Next Steps After Successful Build:
   
a) Testing the AAB using Internal App Sharing:

Internal App Sharing is a Google Play Console feature that allows you to quickly test AAB files:

1. Access Internal App Sharing:
   - Go to play.google.com/console
   - Click on "Internal App Sharing" in the left menu
   - Or use direct URL: https://play.google.com/console/internal-app-sharing

2. Upload your AAB:
   - Download the AAB from: https://expo.dev/artifacts/eas/pRDt5CU92KZCMmxRxmxgBN.aab
   - Drag and drop the AAB file into Internal App Sharing
   - Or click "Upload" and select the file

3. Share and Test:
   - After upload, you'll get a URL
   - Open this URL on an Android device
   - It will prompt to install the app
   - The app installs immediately without Play Store review

Benefits of Internal App Sharing:
- Test AAB files directly without converting to APK
- No need to add test users to Play Console
- Immediate testing without review process
- Tests actual Play Store delivery system
- Works on any Android device with Play Store

Requirements for testers:
- Android device with Play Store installed
- Google Play Store app version 15.1 or higher
- Device running Android 5.0 (API level 21) or higher

Alternative: Local Testing with Bundletool
```bash
# Install bundletool (if not already installed)
# Download from: https://github.com/google/bundletool/releases

# Convert AAB to APKs
bundletool build-apks --bundle=./app.aab --output=./app.apks

# Install on connected device
bundletool install-apks --apks=./app.apks
```

b) Play Store Submission:
   - Log into Google Play Console
   - Create a new release
   - Upload the AAB file
   - Complete store listing
   - Submit for review

Important Production Build Requirements:
- android.package must be properly configured ✅
- Version code management strategy defined ✅
- App signing credentials set up ✅
- Production API endpoints configured (TODO)

## Build Steps

1. **Prepare Your App**
   ```bash
   # Update dependencies
   npm install
   
   # Clear metro bundler cache
   npx expo start --clear
   ```

2. **Configure Build Settings**
   ```bash
   # Initialize EAS build
   eas build:configure
   ```

3. **Run Development Build**
   ```bash
   # For Android
   eas build --profile development --platform android
   
   # For iOS
   eas build --profile development --platform ios
   ```

4. **Submit to Stores**
   ```bash
   # For Android
   eas submit -p android
   
   # For iOS
   eas submit -p ios
   ```

## Play Console Registration and Testing Options

### Play Console Requirements
1. Registration Process:
   - One-time $25 USD registration fee
   - Valid ID for identity verification
   - Non-refundable if verification fails
   - Account approval process

2. When Play Console is Required:
   - Publishing to Google Play Store
   - Using Internal App Sharing feature
   - Setting up in-app purchases
   - Public app distribution

### Free Testing Options (No Play Console Required)

1. **Preview Build** (Recommended):
```bash
eas build --profile preview --platform android
```
Benefits:
- No Play Console registration needed
- Generates installable APK
- Easy to share with team
- Tests production configuration
- Free to use

Example Successful Preview Build:
```
Build ID: c30c87a3-d893-4ddc-a052-19a5fad0dfdd
Status: ✔ Build finished
Location: https://expo.dev/accounts/tnhgeneric/projects/ExpoFE/builds/c30c87a3-d893-4ddc-a052-19a5fad0dfdd
```

Next Steps After Preview Build:
1. Download the APK from the Expo dashboard
2. Install on Android device:
   - Enable "Install from Unknown Sources" in Settings
   - Open downloaded APK
   - Tap "Install"
3. Test all features:
   - Verify backend connectivity
   - Check all app functionality
   - Test user flows
4. Share with team members:
   - Send APK file directly
   - Or share Expo build URL

Installation:
1. Enable "Install from Unknown Sources" on Android
2. Download APK from Expo
3. Tap to install
4. Share APK directly with team

2. **Development Client**:
```bash
npx expo start --dev-client
```
Benefits:
- Rapid testing cycle
- Real-time updates
- Debug capabilities
- No build required

3. **Bundletool** (For AAB Testing):
```bash
# Convert AAB to APK
bundletool build-apks --bundle=./app.aab --output=./app.apks
bundletool install-apks --apks=./app.apks
```
Benefits:
- Test AAB files without Play Console
- Local device testing
- No registration needed
- Free to use

### When to Register for Play Console
- Only when ready to publish to Play Store
- Not needed during development
- Not required for team testing
- Can use preview builds until ready

## Troubleshooting

### Common Issues and Solutions

1. **Backend Connectivity Issues**
   - Verify backend services are running (`uvicorn orchestrate.main:app --host 0.0.0.0 --port 8001`)
   - Check device and development machine are on same network
   - Ensure `usesCleartextTraffic` is true in app.json for HTTP connections
   - Test endpoints directly using curl or PowerShell
   ```powershell
   Invoke-WebRequest -Uri "http://192.168.1.25:8001/health" -Method GET
   ```

2. **Expo Router Issues**
   - Clear Metro cache: `npx expo start --dev-client -c`
   - Verify expo-router version (we use 2.0.0)
   - Check Navigation dependencies are correctly installed
   - Ensure proper babel configuration for expo-router

3. **Development Client Problems**
   - Verify correct dev client installation
   - Check app.json has proper package name
   - Ensure no duplicate package entries
   - Use development profile for builds
   ```bash
   eas build --profile development --platform android
   ```

4. **Dependency Conflicts**
   - Use `--legacy-peer-deps` for specific package installations
   - Match these working versions:
     - expo-router@2.0.0
     - react-native-reanimated@~3.3.0
     - react-native-screens@~3.22.0
     - react-native-safe-area-context@4.6.3

5. **Build Process Issues**
   - Clear Metro cache before new builds
   - Check Android package name is consistent
   - Verify eas.json configuration
   - Ensure proper development client setup

6. **HTTP Traffic Not Working**
   - Verify `expo-build-properties` is installed
   - Check `app.config.js` for correct plugin configuration
   - Ensure `network_security_config.xml` is properly set up
   - Confirm `android:usesCleartextTraffic="true"` is in `AndroidManifest.xml`

### Getting Help
- Check EAS build logs: `eas build:list`
- View detailed log: `eas build:view`
- Expo documentation: https://docs.expo.dev/build/introduction/
- Community forums: https://forums.expo.dev/