module.exports = {
  expo: {
    name: 'ExpoFE',
    slug: 'ExpoFE',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
      android: {
      package: "com.tnhgeneric.multiagenetic",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "ACCESS_WIFI_STATE"
      ],
      networkSecurityConfig: "./android/app/src/main/res/xml/network_security_config.xml",
      usesCleartextTraffic: true,
      allowBackup: true,
      buildToolsVersion: "33.0.0",
      targetSdkVersion: 33,
      compileSdkVersion: 33
    },
    extra: {
      // EAS build will inject EXPO_PUBLIC_BACKEND_URL via eas.json
      EXPO_PUBLIC_BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL,
      // Fallback for local development - points to Prompt Processor
      backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://192.168.1.25:8000',
      // For production, use secure HTTPS endpoints
      productionBackendUrl: 'https://your-production-backend.com'
    },
    ios: {
      supportsTablet: true
    },
    experiments: {
      tsconfigPaths: true
    },
    web: {
      bundler: "metro"
    },
    packagerOpts: {
      sourceExts: ["js", "json", "ts", "tsx", "jsx"],
      config: "metro.config.js"
    },
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    scheme: 'expofe',
    web: {
      bundler: 'metro'
    },
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
      [
        'expo-router',
        {
          origin: './app'
        }
      ]
    ]
  }
};