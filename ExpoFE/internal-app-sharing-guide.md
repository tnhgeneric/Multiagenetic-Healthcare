# Internal App Sharing Guide

## Step 1: Download Your AAB File
1. Go to your Expo build page:
   - URL: https://expo.dev/artifacts/eas/pRDt5CU92KZCMmxRxmxgBN.aab
   - Click "Download" to save the AAB file
   - Note where you saved the file

## Step 2: Access Google Play Console
1. Open your browser and go to [Google Play Console](https://play.google.com/console)
2. Sign in with your Google account that has Play Console access
3. If you haven't set up your account yet:
   - Pay the one-time $25 registration fee
   - Complete the developer account setup

## Step 3: Navigate to Internal App Sharing
1. In Play Console, look for "Internal App Sharing" in two places:
   - Option 1: Left sidebar menu under "Setup"
   - Option 2: Direct URL: https://play.google.com/console/internal-app-sharing

## Step 4: Upload Your AAB
1. In the Internal App Sharing page:
   - Click the "Upload" button
   - OR drag and drop your AAB file directly
2. Wait for the upload to complete
3. The system will process your AAB (usually takes 1-2 minutes)

## Step 5: Get Sharing URL
1. After processing completes:
   - You'll see a success message
   - A sharing URL will be generated automatically
2. Copy the sharing URL
3. Optional: Click "Share" to:
   - Get a QR code
   - Send via email
   - Copy link to clipboard

## Step 6: Test on Android Device
1. Prepare your Android device:
   - Ensure you have Google Play Store version 15.1 or higher
   - Device must run Android 5.0 or higher
   - Make sure you're signed into your Google account

2. Install the app:
   - Open the sharing URL on your Android device
   - OR scan the QR code if you generated one
   - You'll see a Play Store page
   - Click "Install" to download and install the app

3. If you get a warning:
   - You might see "Unknown source" warning
   - This is normal for internal app sharing
   - Click "Continue" or "Install anyway"

## Step 7: Testing the App
1. After installation:
   - Open the app
   - Test all features
   - Note any issues
   - The app will work just like a Play Store version

## Important Notes

### Security Considerations:
- Anyone with the sharing URL can install the app
- Links expire after 30 days
- You can revoke access by deleting the upload
- New upload = new sharing URL

## Alternative: Testing without Play Console (Free Method)

If you haven't registered for Play Console yet, you can test your AAB using bundletool:

1. Install Java Development Kit (JDK) if not installed

2. Download bundletool:
   - Go to: https://github.com/google/bundletool/releases
   - Download the latest bundletool-all-X.X.X.jar
   - Rename it to `bundletool.jar` for convenience

3. Set up your environment:
   ```powershell
   # Create an alias for bundletool (PowerShell)
   $env:BUNDLETOOL_PATH = "path\to\bundletool.jar"
   function bundletool { java -jar $env:BUNDLETOOL_PATH $args }
   ```

4. Convert AAB to APKs:
   ```powershell
   # Create APKs from your AAB
   bundletool build-apks --bundle=.\pRDt5CU92KZCMmxRxmxgBN.aab --output=.\app.apks

   # Install on connected device (make sure USB debugging is enabled)
   bundletool install-apks --apks=.\app.apks
   ```

5. Enable USB Debugging on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings → System → Developer Options
   - Enable "USB Debugging"
   - Connect your device via USB
   - Accept the debugging prompt on your device

This method allows you to:
- Test your AAB file without Play Console registration
- Install directly to your device
- Test all app features locally
- Debug any issues before Play Store submission

### Testing Tips:
1. Test on multiple Android versions
2. Try different device sizes
3. Check all app features
4. Verify the app bundle ID matches expected package name
5. Test your production backend URLs

### Troubleshooting:
1. If installation fails:
   - Check Play Store version
   - Verify Android version
   - Ensure Google Play Services is up to date
   - Clear Play Store cache

2. If app won't open:
   - Check device compatibility
   - Look for crash logs
   - Verify signing certificate

### Next Steps After Testing:
1. If everything works:
   - Proceed with Play Store submission
   - Use same AAB file for store release

2. If you find issues:
   - Fix the problems
   - Create new build
   - Test new AAB through internal sharing again

## Commands Reference

To get your current Play Store version:
```bash
# On your Android device
Settings -> Apps -> Google Play Store -> App Details
```

To clear Play Store cache:
```bash
Settings -> Apps -> Google Play Store -> Storage -> Clear Cache
```