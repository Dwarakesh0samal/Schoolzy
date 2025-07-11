# 🛠️ Schoolzy - Complete Setup Guide

## 📋 Prerequisites & Required Software

### **1. Core Development Tools**

#### **Node.js & npm**
- **Download**: [nodejs.org](https://nodejs.org/)
- **Version**: 18.x or higher (LTS recommended)
- **Installation**: Download and run installer
- **Verify**: `node --version` and `npm --version`

#### **Git**
- **Download**: [git-scm.com](https://git-scm.com/)
- **Version**: Latest stable
- **Installation**: Download and run installer
- **Verify**: `git --version`

#### **Code Editor**
- **VS Code** (Recommended): [code.visualstudio.com](https://code.visualstudio.com/)
- **Extensions needed**:
  - ESLint
  - Prettier
  - Auto Rename Tag
  - Bracket Pair Colorizer
  - GitLens
  - Live Server

### **2. Database & Cloud Services**

#### **Firebase Account**
- **Sign up**: [firebase.google.com](https://firebase.google.com/)
- **Required services**:
  - Firestore Database
  - Authentication
  - Storage (optional)

#### **SQLite** (Optional - comes with Node.js)
- **Included**: With Node.js installation
- **Verify**: `sqlite3 --version`

### **3. Development Environment Setup**

#### **Package Managers**
```bash
# npm (comes with Node.js)
npm --version

# Optional: Install yarn
npm install -g yarn
yarn --version
```

#### **Global Development Tools**
```bash
# Install useful global packages
npm install -g nodemon
npm install -g eslint
npm install -g prettier
npm install -g http-server
```

## 🚀 Project Setup Instructions

### **Step 1: Create Project Structure**
```bash
# Create project directory
mkdir Schoolzy
cd Schoolzy

# Create backend and frontend directories
mkdir backend frontend
```

### **Step 2: Initialize Backend**
```bash
cd backend

# Initialize package.json
npm init -y

# Install dependencies
npm install express cors helmet compression express-rate-limit dotenv
npm install passport passport-local passport-google-oauth20 passport-facebook
npm install express-session bcryptjs jsonwebtoken multer validator
npm install sqlite3 firebase-admin

# Install dev dependencies
npm install --save-dev nodemon eslint jest supertest
npm install --save-dev eslint-config-standard eslint-plugin-import
npm install --save-dev eslint-plugin-node eslint-plugin-promise
```

### **Step 3: Initialize Frontend**
```bash
cd ../frontend

# Initialize package.json
npm init -y

# Install Vite
npm install --save-dev vite

# Install dependencies
npm install leaflet

# Install dev dependencies
npm install --save-dev eslint terser
```

### **Step 4: Firebase Setup**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Firestore Database
4. Go to Project Settings → Service Accounts
5. Generate new private key
6. Save as `backend/serviceAccountKey.json`

### **Step 5: Environment Configuration**
```bash
# Create .env file in backend directory
cd ../backend
touch .env
```

Add to `.env`:
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

## 📁 Required File Structure

```
Schoolzy/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── schoolController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── isAdmin.js
│   │   ├── validation.js
│   │   └── errorHandlers.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── schools.js
│   │   ├── reviews.js
│   │   └── admin.js
│   ├── utils/
│   │   └── dataSanitizer.js
│   ├── tests/
│   │   ├── setup.js
│   │   └── auth.test.js
│   ├── uploads/
│   ├── app.js
│   ├── server.js
│   ├── firestore.js
│   ├── sessionStore.js
│   ├── seedData.js
│   ├── package.json
│   ├── .env
│   └── serviceAccountKey.json
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── config.js
│   ├── styles.css
│   ├── vite.config.js
│   ├── package.json
│   └── sw.js
├── README.md
└── SETUP_GUIDE.md
```

## 🔧 Configuration Files

### **Backend package.json Scripts**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seedData.js",
    "test": "jest --detectOpenHandles --forceExit",
    "test:watch": "jest --watch --detectOpenHandles",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
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
    "lint": "eslint . --ext js,html"
  }
}
```

### **Vite Configuration (frontend/vite.config.js)**
```javascript
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
```

## 🌐 External Services Setup

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

### **OpenStreetMap (Free)**
- No setup required
- Used for interactive maps
- Leaflet.js integration

## 🚀 Running the Application

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

## 🧪 Testing Setup

### **Install Testing Dependencies**
```bash
cd backend
npm install --save-dev jest supertest
```

### **Run Tests**
```bash
npm test
npm run test:watch
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

## 🔒 Security Checklist

### **Environment Variables**
- [ ] JWT_SECRET (strong, random string)
- [ ] SESSION_SECRET (different from JWT_SECRET)
- [ ] Firebase credentials
- [ ] OAuth credentials

### **Security Headers**
- [ ] Helmet.js configured
- [ ] CORS properly set
- [ ] Rate limiting enabled
- [ ] Input validation

### **Database Security**
- [ ] Firebase security rules
- [ ] SQL injection prevention
- [ ] Data sanitization

## 📦 Deployment Options

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

## 🆘 Troubleshooting

### **Common Issues**
1. **Port conflicts**: Change ports in .env and vite.config.js
2. **CORS errors**: Check CORS configuration in app.js
3. **Firebase connection**: Verify serviceAccountKey.json
4. **OAuth errors**: Check redirect URIs and credentials

### **Useful Commands**
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for security vulnerabilities
npm audit
npm audit fix
```

## 📚 Additional Resources

### **Documentation**
- [Express.js](https://expressjs.com/)
- [Firebase](https://firebase.google.com/docs)
- [Passport.js](http://www.passportjs.org/)
- [Leaflet.js](https://leafletjs.com/)
- [Vite](https://vitejs.dev/)

### **Learning Resources**
- [Node.js Tutorial](https://nodejs.org/en/learn/)
- [JavaScript ES6+](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [CSS Grid & Flexbox](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

## ✅ Setup Checklist

- [ ] Node.js installed
- [ ] Git installed
- [ ] Code editor configured
- [ ] Firebase project created
- [ ] OAuth credentials obtained
- [ ] Project structure created
- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] Database configured
- [ ] Application running locally
- [ ] Tests passing
- [ ] Security measures implemented

Once you've completed this checklist, your Schoolzy application should be ready for development and deployment! 🎉 