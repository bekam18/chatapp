@echo off
echo Creating React Native Mobile App...
echo.

echo Step 1: Installing React Native CLI globally...
npm install -g @react-native-community/cli

echo.
echo Step 2: Creating React Native project...
npx react-native init ChatAppMobile --directory mobile

echo.
echo Step 3: Installing dependencies...
cd mobile
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install socket.io-client axios
npm install react-native-vector-icons
npm install @react-native-async-storage/async-storage

echo.
echo Mobile app setup complete!
echo.
echo To run the app:
echo 1. cd mobile
echo 2. npx react-native run-android (for Android)
echo 3. npx react-native run-ios (for iOS - Mac only)
echo.
pause