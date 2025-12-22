@echo off
echo Setting up MySQL database for Chat App...
echo.
echo Please enter your MySQL root password when prompted.
echo.

"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "CREATE DATABASE IF NOT EXISTS chat_app; USE chat_app; SOURCE database/schema.sql;"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database setup completed successfully!
    echo.
) else (
    echo.
    echo ❌ Database setup failed. Please check your MySQL credentials.
    echo.
)

pause