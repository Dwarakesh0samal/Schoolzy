@echo off
REM 🎓 Schoolzy Installation Script for Windows
REM This script will set up the complete Schoolzy development environment

echo 🎓 Welcome to Schoolzy Installation Script!
echo ==========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version
echo ✅ npm version: 
npm --version

REM Create project structure
echo 📁 Creating project structure...
if not exist "Schoolzy" mkdir Schoolzy
cd Schoolzy
if not exist "backend" mkdir backend
if not exist "frontend" mkdir frontend

REM Initialize backend
echo 🔧 Setting up backend...
cd backend

REM Create package.json
echo {> package.json
echo   "name": "schoolzy-backend",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "description": "Schoolzy - School Directory with OAuth and Reviews",>> package.json
echo   "main": "server.js",>> package.json
echo   "scripts": {>> package.json
echo     "start": "node server.js",>> package.json
echo     "dev": "nodemon server.js",>> package.json
echo     "seed": "node seedData.js",>> package.json
echo     "test": "jest --detectOpenHandles --forceExit",>> package.json
echo     "lint": "eslint .">> package.json
echo   },>> package.json
echo   "keywords": [],>> package.json
echo   "author": "",>> package.json
echo   "license": "ISC">> package.json
echo }>> package.json

REM Install backend dependencies
echo 📦 Installing backend dependencies...
call npm install express cors helmet compression express-rate-limit dotenv
call npm install passport passport-local passport-google-oauth20 passport-facebook
call npm install express-session bcryptjs jsonwebtoken multer validator
call npm install sqlite3 firebase-admin

REM Install dev dependencies
call npm install --save-dev nodemon eslint jest supertest
call npm install --save-dev eslint-config-standard eslint-plugin-import
call npm install --save-dev eslint-plugin-node eslint-plugin-promise

REM Create directories
if not exist "controllers" mkdir controllers
if not exist "middleware" mkdir middleware
if not exist "routes" mkdir routes
if not exist "utils" mkdir utils
if not exist "tests" mkdir tests
if not exist "uploads" mkdir uploads

REM Create .env template
echo NODE_ENV=development> .env.example
echo PORT=5000>> .env.example
echo JWT_SECRET=your-super-secret-jwt-key-here>> .env.example
echo SESSION_SECRET=your-session-secret-here>> .env.example
echo CORS_ORIGIN=http://localhost:3000>> .env.example
echo.>> .env.example
echo # Firebase Configuration>> .env.example
echo FIREBASE_PROJECT_ID=your-project-id>> .env.example
echo FIREBASE_PRIVATE_KEY="your-private-key">> .env.example
echo FIREBASE_CLIENT_EMAIL=your-client-email>> .env.example
echo.>> .env.example
echo # OAuth Configuration>> .env.example
echo GOOGLE_CLIENT_ID=your-google-client-id>> .env.example
echo GOOGLE_CLIENT_SECRET=your-google-client-secret>> .env.example
echo FACEBOOK_APP_ID=your-facebook-app-id>> .env.example
echo FACEBOOK_APP_SECRET=your-facebook-app-secret>> .env.example

echo 📝 Created .env.example - Please copy to .env and fill in your credentials

REM Initialize frontend
echo 🎨 Setting up frontend...
cd ..\frontend

REM Create package.json
echo {> package.json
echo   "name": "schoolzy-frontend",>> package.json
echo   "version": "1.0.0",>> package.json
echo   "description": "Schoolzy Frontend - Find your perfect school",>> package.json
echo   "type": "module",>> package.json
echo   "scripts": {>> package.json
echo     "dev": "vite",>> package.json
echo     "build": "vite build",>> package.json
echo     "preview": "vite preview",>> package.json
echo     "lint": "eslint . --ext js,html">> package.json
echo   },>> package.json
echo   "devDependencies": {>> package.json
echo     "eslint": "^8.0.0",>> package.json
echo     "terser": "^5.43.1",>> package.json
echo     "vite": "^5.4.19">> package.json
echo   },>> package.json
echo   "dependencies": {>> package.json
echo     "leaflet": "^1.9.4">> package.json
echo   }>> package.json
echo }>> package.json

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
call npm install --save-dev vite eslint terser
call npm install leaflet

REM Create basic HTML file
echo ^<!DOCTYPE html^>> index.html
echo ^<html lang="en"^>>> index.html
echo ^<head^>>> index.html
echo     ^<meta charset="UTF-8"^>>> index.html
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>>> index.html
echo     ^<title^>Schoolzy - Find Your Perfect School^</title^>>> index.html
echo     ^<link rel="stylesheet" href="styles.css"^>>> index.html
echo ^</head^>>> index.html
echo ^<body^>>> index.html
echo     ^<div id="app"^>>> index.html
echo         ^<h1^>🎓 Schoolzy^</h1^>>> index.html
echo         ^<p^>Your school directory application is being set up...^</p^>>> index.html
echo     ^</div^>>> index.html
echo     ^<script type="module" src="app.js"^>^</script^>>> index.html
echo ^</body^>>> index.html
echo ^</html^>>> index.html

REM Create basic CSS
echo * {> styles.css
echo     margin: 0;>> styles.css
echo     padding: 0;>> styles.css
echo     box-sizing: border-box;>> styles.css
echo }>> styles.css
echo.>> styles.css
echo body {>> styles.css
echo     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;>> styles.css
echo     background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);>> styles.css
echo     min-height: 100vh;>> styles.css
echo     display: flex;>> styles.css
echo     align-items: center;>> styles.css
echo     justify-content: center;>> styles.css
echo     color: white;>> styles.css
echo }>> styles.css
echo.>> styles.css
echo #app {>> styles.css
echo     text-align: center;>> styles.css
echo     padding: 2rem;>> styles.css
echo }>> styles.css
echo.>> styles.css
echo h1 {>> styles.css
echo     font-size: 3rem;>> styles.css
echo     margin-bottom: 1rem;>> styles.css
echo }>> styles.css
echo.>> styles.css
echo p {>> styles.css
echo     font-size: 1.2rem;>> styles.css
echo     opacity: 0.9;>> styles.css
echo }>> styles.css

REM Create basic JS
echo console.log('🎓 Schoolzy Frontend loaded successfully!');> app.js
echo.>> app.js
echo // Basic app initialization>> app.js
echo document.addEventListener('DOMContentLoaded', function() {>> app.js
echo     console.log('DOM loaded, ready to build your school directory!');>> app.js
echo });>> app.js

cd ..

echo.
echo 🎉 Installation completed successfully!
echo ======================================
echo.
echo 📋 Next steps:
echo 1. cd Schoolzy\backend
echo 2. copy .env.example .env
echo 3. Edit .env with your Firebase and OAuth credentials
echo 4. Set up Firebase project and download serviceAccountKey.json
echo 5. Run 'npm run dev' in backend directory
echo 6. Run 'npm run dev' in frontend directory
echo.
echo 📚 For detailed setup instructions, see SETUP_GUIDE.md
echo.
echo 🌐 Access your application:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:5000
echo.
echo Happy coding! 🚀
pause 