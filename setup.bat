@echo off
echo 🎓 Schoolzy Setup Script
echo =======================

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.
echo 📋 Required Software:
echo 1. Node.js 18+ (✅ Installed)
echo 2. Git (Download from https://git-scm.com/)
echo 3. VS Code (Download from https://code.visualstudio.com/)
echo 4. Firebase Account (Sign up at https://firebase.google.com/)
echo 5. Google OAuth (Setup at https://console.cloud.google.com/)
echo 6. Facebook OAuth (Setup at https://developers.facebook.com/)
echo.
echo 📚 For complete setup instructions, see SETUP_GUIDE.md
echo.
pause 