@echo off
echo Creating Flutter Chat App...
echo.

echo Step 1: Checking Flutter installation...
flutter doctor

echo.
echo Step 2: Creating Flutter project...
flutter create flutter_app

echo.
echo Step 3: Moving to Flutter directory...
cd flutter_app

echo.
echo Step 4: Getting dependencies...
flutter pub get

echo.
echo Flutter app created successfully!
echo.
echo To run the app:
echo 1. cd flutter_app
echo 2. flutter run (make sure device/emulator is connected)
echo.
echo To build APK:
echo 1. flutter build apk
echo.
pause