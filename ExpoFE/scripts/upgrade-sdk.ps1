# Update Expo SDK and related packages
Write-Host "Updating Expo SDK and related packages..." -ForegroundColor Green
npx expo install expo@~54.0.0
npx expo install react@18.2.0
npx expo install react-native@0.73.2
npx expo install expo-constants@~15.4.5
npx expo install expo-router@^3.4.6
npx expo install expo-splash-screen@~0.26.4
npx expo install expo-status-bar@~1.11.1
npx expo install expo-system-ui@~2.9.3
npx expo install expo-web-browser@~12.8.2
npx expo install react-native-screens@~3.29.0
npx expo install react-native-safe-area-context@4.8.2
npx expo install react-native-gesture-handler@~2.14.0
npx expo install react-native-reanimated@~3.6.0

# Clean up
Write-Host "Cleaning up node_modules..." -ForegroundColor Green
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm install

# Clear metro cache
Write-Host "Clearing Metro cache..." -ForegroundColor Green
npx expo start --clear