# 🛠️ Schoolzy - Software Requirements & Installation Guide

## 📋 Essential Software Requirements

### **1. Core Development Environment**

#### **Node.js Runtime**
- **Version**: 18.x or higher (LTS recommended)
- **Download**: https://nodejs.org/
- **Purpose**: JavaScript runtime for backend server
- **Verification**: `node --version`
- **Package Manager**: npm (included with Node.js)

#### **Git Version Control**
- **Version**: Latest stable
- **Download**: https://git-scm.com/
- **Purpose**: Source code management and collaboration
- **Verification**: `git --version`

#### **Code Editor/IDE**
- **VS Code** (Recommended): https://code.visualstudio.com/
- **Alternative**: WebStorm, Sublime Text, Atom
- **Required Extensions**:
  - ESLint (JavaScript linting)
  - Prettier (Code formatting)
  - Auto Rename Tag (HTML/XML)
  - Bracket Pair Colorizer
  - GitLens (Git integration)
  - Live Server (Development server)

### **2. Database & Cloud Services**

#### **Firebase Account**
- **URL**: https://firebase.google.com/
- **Required Services**:
  - Firestore Database (NoSQL cloud database)
  - Authentication (User management)
  - Storage (File uploads - optional)
- **Setup**: Create project, enable services, download credentials

#### **SQLite** (Local Development)
- **Included**: With Node.js installation
- **Purpose**: Local database for development
- **Verification**: `sqlite3 --version`

### **3. External APIs & Services**

#### **Google OAuth 2.0**
- **URL**: https://console.cloud.google.com/
- **Purpose**: Social login authentication
- **Setup**: Create project, enable APIs, configure credentials

#### **Facebook OAuth**
- **URL**: https://developers.facebook.com/
- **Purpose**: Social login authentication
- **Setup**: Create app, configure OAuth settings

#### **OpenStreetMap** (Free)
- **URL**: https://www.openstreetmap.org/
- **Purpose**: Interactive maps
- **Setup**: No account required, used via Leaflet.js

## 🚀 Installation Commands

### **Global Development Tools**
```bash
# Install useful global packages
npm install -g nodemon
npm install -g eslint
npm install -g prettier
npm install -g http-server

# Optional: Install yarn as alternative to npm
npm install -g yarn
```

### **Backend Dependencies**
```bash
# Core framework and middleware
npm install express cors helmet compression express-rate-limit dotenv

# Authentication and security
npm install passport passport-local passport-google-oauth20 passport-facebook
npm install express-session bcryptjs jsonwebtoken

# File handling and validation
npm install multer validator

# Database
npm install sqlite3 firebase-admin

# Development tools
npm install --save-dev nodemon eslint jest supertest
npm install --save-dev eslint-config-standard eslint-plugin-import
npm install --save-dev eslint-plugin-node eslint-plugin-promise
```

### **Frontend Dependencies**
```bash
# Build tool
npm install --save-dev vite

# Map library
npm install leaflet

# Development tools
npm install --save-dev eslint terser
```

## 📁 Required File Structure

```
Schoolzy/
├── backend/
│   ├── controllers/          # Business logic
│   │   ├── authController.js
│   │   ├── schoolController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── middleware/           # Request processing
│   │   ├── auth.js
│   │   ├── isAdmin.js
│   │   ├── validation.js
│   │   └── errorHandlers.js
│   ├── routes/              # API endpoints
│   │   ├── auth.js
│   │   ├── schools.js
│   │   ├── reviews.js
│   │   └── admin.js
│   ├── utils/               # Helper functions
│   │   └── dataSanitizer.js
│   ├── tests/               # Test files
│   │   ├── setup.js
│   │   └── auth.test.js
│   ├── uploads/             # File uploads
│   ├── app.js              # Express app configuration
│   ├── server.js           # Server entry point
│   ├── firestore.js        # Firebase configuration
│   ├── sessionStore.js     # Session management
│   ├── seedData.js         # Database seeding
│   ├── package.json        # Backend dependencies
│   ├── .env               # Environment variables
│   └── serviceAccountKey.json  # Firebase credentials
├── frontend/
│   ├── index.html         # Main application page
│   ├── app.js            # Frontend JavaScript
│   ├── config.js         # Configuration
│   ├── styles.css        # Application styles
│   ├── vite.config.js    # Build configuration
│   ├── package.json      # Frontend dependencies
│   └── sw.js            # Service worker (PWA)
├── README.md
├── SETUP_GUIDE.md
└── SOFTWARE_REQUIREMENTS.md
```

## 🔧 Configuration Files

### **Backend package.json Scripts**
```json
{
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
  }
}
```

### **Frontend package.json Scripts**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,html --report-unused-disable-directives --max-warnings 0"
  }
}
```

### **Environment Variables (.env)**
```env
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
```

## 🌐 External Service Setup

### **Firebase Setup**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Firestore Database
4. Go to Project Settings → Service Accounts
5. Generate new private key
6. Save as `backend/serviceAccountKey.json`

### **Google OAuth Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `https://your-domain.com/api/auth/google/callback`

### **Facebook OAuth Setup**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs
5. Get App ID and App Secret

## 🚀 Quick Start Commands

### **Development Mode**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### **Production Build**
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ../backend
npm start
```

## 📱 Browser Requirements

### **Supported Browsers**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### **Mobile Support**
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

## 🔒 Security Requirements

### **Environment Variables**
- Strong JWT secret (32+ characters)
- Unique session secret
- Secure Firebase credentials
- Valid OAuth credentials

### **Security Headers**
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation

### **Database Security**
- Firebase security rules
- SQL injection prevention
- Data sanitization

## 📦 Deployment Platforms

### **Free Options**
- **Render.com** (Recommended)
- **Railway.app**
- **Vercel** (Frontend only)
- **Netlify** (Frontend only)

### **Paid Options**
- **Heroku**
- **DigitalOcean**
- **AWS**
- **Google Cloud Platform**

## 🧪 Testing Requirements

### **Testing Framework**
- Jest for unit and integration tests
- Supertest for API testing
- Coverage reporting

### **Test Commands**
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 🆘 Troubleshooting

### **Common Issues**
1. **Port conflicts**: Change ports in .env and vite.config.js
2. **CORS errors**: Check CORS configuration in app.js
3. **Firebase connection**: Verify serviceAccountKey.json
4. **OAuth errors**: Check redirect URIs and credentials

### **Useful Commands**
```bash
# Check versions
node --version
npm --version

# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Security audit
npm audit
npm audit fix
```

## 📚 Learning Resources

### **Documentation**
- [Express.js](https://expressjs.com/)
- [Firebase](https://firebase.google.com/docs)
- [Passport.js](http://www.passportjs.org/)
- [Leaflet.js](https://leafletjs.com/)
- [Vite](https://vitejs.dev/)

### **Tutorials**
- [Node.js Tutorial](https://nodejs.org/en/learn/)
- [JavaScript ES6+](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [CSS Grid & Flexbox](https://css-tricks.com/snippets/css/complete-guide-grid/)

## ✅ Installation Checklist

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Code editor configured with extensions
- [ ] Firebase project created
- [ ] OAuth credentials obtained
- [ ] Project structure created
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Database configured
- [ ] Application running locally
- [ ] Tests passing
- [ ] Security measures implemented

## 🎯 System Requirements

### **Minimum Requirements**
- **OS**: Windows 10, macOS 10.14+, or Linux
- **RAM**: 4GB
- **Storage**: 2GB free space
- **Network**: Internet connection for dependencies

### **Recommended Requirements**
- **OS**: Windows 11, macOS 12+, or Ubuntu 20.04+
- **RAM**: 8GB
- **Storage**: 5GB free space
- **Network**: High-speed internet connection

---

**Note**: This guide assumes you have basic knowledge of JavaScript, Node.js, and web development concepts. For beginners, consider starting with the learning resources listed above. 