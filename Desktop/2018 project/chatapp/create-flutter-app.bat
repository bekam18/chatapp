@echo off
echo 📱 Flutter Chat App - Phone Setup
echo.

echo Step 1: Checking Flutter installation...
flutter doctor
echo.

echo Step 2: Checking connected devices...
flutter devices
echo.

echo Step 3: Moving to Flutter app directory...
cd flutter_app

echo Step 4: Getting Flutter dependencies...
flutter pub get
echo.

echo Step 5: Ready to run on your phone!
echo.
echo Make sure your phone is connected via USB with:
echo - USB Debugging enabled
echo - Developer mode enabled
echo - Phone unlocked and "Allow USB Debugging" accepted
echo.
echo Press any key to run the app on your phone...
pause

echo.
echo 🚀 Running Flutter app on your phone...
flutter run

echo.
echo App should now be running on your phone!
echo.
echo Hot reload commands:
echo - Press 'r' for hot reload
echo - Press 'R' for hot restart  
echo - Press 'q' to quit
echo.
pause