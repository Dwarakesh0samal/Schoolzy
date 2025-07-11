#!/bin/bash

# 🎓 Schoolzy Installation Script
# This script will set up the complete Schoolzy development environment

echo "🎓 Welcome to Schoolzy Installation Script!"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Create project structure
echo "📁 Creating project structure..."
mkdir -p Schoolzy/{backend,frontend}
cd Schoolzy

# Initialize backend
echo "🔧 Setting up backend..."
cd backend

# Create package.json
cat > package.json << 'EOF'
{
  "name": "schoolzy-backend",
  "version": "1.0.0",
  "description": "Schoolzy - School Directory with OAuth and Reviews",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seedData.js",
    "cleanup-sessions": "node cleanupSessions.js",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "test": "jest --detectOpenHandles --forceExit",
    "test:watch": "jest --watch --detectOpenHandles",
    "test:coverage": "jest --coverage --detectOpenHandles --forceExit"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
EOF

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install express cors helmet compression express-rate-limit dotenv
npm install passport passport-local passport-google-oauth20 passport-facebook
npm install express-session bcryptjs jsonwebtoken multer validator
npm install sqlite3 firebase-admin

# Install dev dependencies
npm install --save-dev nodemon eslint jest supertest
npm install --save-dev eslint-config-standard eslint-plugin-import
npm install --save-dev eslint-plugin-node eslint-plugin-promise

# Create directories
mkdir -p controllers middleware routes utils tests uploads

# Create .env template
cat > .env.example << 'EOF'
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-here
CORS_ORIGIN=http://localhost:3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-client-email

# OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
EOF

echo "📝 Created .env.example - Please copy to .env and fill in your credentials"

# Initialize frontend
echo "🎨 Setting up frontend..."
cd ../frontend

# Create package.json
cat > package.json << 'EOF'
{
  "name": "schoolzy-frontend",
  "version": "1.0.0",
  "description": "Schoolzy Frontend - Find your perfect school",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,html --report-unused-disable-directives --max-warnings 0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "terser": "^5.43.1",
    "vite": "^5.4.19"
  },
  "dependencies": {
    "leaflet": "^1.9.4"
  }
}
EOF

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install --save-dev vite eslint terser
npm install leaflet

# Create Vite config
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      input: {
        main: 'index.html'
      },
      output: {
        manualChunks: {
          vendor: ['leaflet']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    open: true
  },
  define: {
    __VITE_API_URL__: JSON.stringify(process.env.VITE_API_URL)
  },
  optimizeDeps: {
    include: ['leaflet']
  }
})
EOF

# Create basic HTML file
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Schoolzy - Find Your Perfect School</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div id="app">
        <h1>🎓 Schoolzy</h1>
        <p>Your school directory application is being set up...</p>
    </div>
    <script type="module" src="app.js"></script>
</body>
</html>
EOF

# Create basic CSS
cat > styles.css << 'EOF'
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

#app {
    text-align: center;
    padding: 2rem;
}

h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
}

p {
    font-size: 1.2rem;
    opacity: 0.9;
}
EOF

# Create basic JS
cat > app.js << 'EOF'
console.log('🎓 Schoolzy Frontend loaded successfully!');

// Basic app initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, ready to build your school directory!');
});
EOF

# Create config file
cat > config.js << 'EOF'
// Configuration for Schoolzy Frontend
const hostname = window.location.hostname;
const protocol = window.location.protocol;

const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
const isProduction = hostname.includes('render.com') || hostname.includes('vercel.app');

let API_BASE_URL;

if (isDevelopment) {
    API_BASE_URL = 'http://localhost:5000/api';
} else if (isProduction) {
    API_BASE_URL = `${protocol}//${hostname}/api`;
} else {
    API_BASE_URL = `${protocol}//${hostname}/api`;
}

window.SCHOOLZY_CONFIG = {
    API_BASE_URL,
    isDevelopment,
    isProduction,
    hostname,
    protocol
};

console.log('Schoolzy Frontend Configuration:', window.SCHOOLZY_CONFIG);
EOF

cd ..

# Create README
cat > README.md << 'EOF'
# 🎓 Schoolzy

A comprehensive school directory application built with Node.js, Express, and modern web technologies.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase project set up
- OAuth credentials (Google/Facebook)

### Installation
1. Copy `.env.example` to `.env` in the backend directory
2. Fill in your Firebase and OAuth credentials
3. Run the development servers:

```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📚 Documentation
See SETUP_GUIDE.md for detailed setup instructions.

## 🛠️ Development
- Backend: Express.js with SQLite + Firebase
- Frontend: Vanilla JavaScript with Vite
- Maps: Leaflet.js with OpenStreetMap
- Authentication: Passport.js with OAuth

Made with ❤️ for better education discovery
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Firebase
serviceAccountKey.json
firebase-debug.log

# Build outputs
dist/
build/
*.tgz
*.tar.gz

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# Database
*.db
*.sqlite
*.sqlite3

# Uploads
uploads/*
!uploads/.gitkeep

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
EOF

echo ""
echo "🎉 Installation completed successfully!"
echo "======================================"
echo ""
echo "📋 Next steps:"
echo "1. cd Schoolzy/backend"
echo "2. cp .env.example .env"
echo "3. Edit .env with your Firebase and OAuth credentials"
echo "4. Set up Firebase project and download serviceAccountKey.json"
echo "5. Run 'npm run dev' in backend directory"
echo "6. Run 'npm run dev' in frontend directory"
echo ""
echo "📚 For detailed setup instructions, see SETUP_GUIDE.md"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "Happy coding! 🚀" 