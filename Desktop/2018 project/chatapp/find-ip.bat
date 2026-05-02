@echo off
echo 🌐 Finding Your Computer's IP Address for Flutter Development
echo.

echo Your computer's IP addresses:
echo.
ipconfig | findstr /i "IPv4"

echo.
echo 📱 Instructions:
echo 1. Copy one of the IPv4 addresses above (usually 192.168.x.x)
echo 2. Open flutter_app/lib/utils/constants.dart
echo 3. Replace 'YOUR_COMPUTER_IP' with your actual IP
echo 4. Example: 'http://192.168.1.100:5000'
echo.
echo Make sure your phone and computer are on the same WiFi network!
echo.
pause