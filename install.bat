@echo off
echo ========================================
echo JCB Rental Management Dashboard
echo Installation Script
echo ========================================
echo.

echo [1/3] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js is installed: 
node --version
echo.

echo [2/3] Installing dependencies...
echo This may take a few minutes...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo.

echo [3/3] Installation complete!
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Configure Firebase:
echo    - Open src/config/firebase.js
echo    - Replace placeholder values with your Firebase config
echo.
echo 2. Start the development server:
echo    - Run: npm run dev
echo.
echo 3. Open your browser at: http://localhost:3000
echo.
echo For detailed setup instructions, see SETUP_GUIDE.md
echo ========================================
echo.
pause
