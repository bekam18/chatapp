# PowerShell script to set up MySQL database
Write-Host "Setting up MySQL database for Chat App..." -ForegroundColor Green
Write-Host ""

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

if (Test-Path $mysqlPath) {
    Write-Host "MySQL found at: $mysqlPath" -ForegroundColor Yellow
    Write-Host "Please enter your MySQL root password when prompted." -ForegroundColor Yellow
    Write-Host ""
    
    # Create database and run schema
    $sqlCommands = @"
CREATE DATABASE IF NOT EXISTS chat_app;
USE chat_app;
SOURCE database/schema.sql;
"@
    
    # Save commands to temp file
    $tempFile = "temp_setup.sql"
    $sqlCommands | Out-File -FilePath $tempFile -Encoding UTF8
    
    try {
        & $mysqlPath -u root -p -e "SOURCE $tempFile"
        Write-Host ""
        Write-Host "✅ Database setup completed successfully!" -ForegroundColor Green
        Write-Host ""
    }
    catch {
        Write-Host ""
        Write-Host "❌ Database setup failed. Please check your MySQL credentials." -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
    }
    finally {
        # Clean up temp file
        if (Test-Path $tempFile) {
            Remove-Item $tempFile
        }
    }
} else {
    Write-Host "❌ MySQL not found at expected location." -ForegroundColor Red
    Write-Host "Please install MySQL or update the path in this script." -ForegroundColor Red
}

Read-Host "Press Enter to continue"