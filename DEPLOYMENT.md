# 🚀 Schoolzy Deployment Guide

## 📋 Prerequisites

- Node.js 16+ and npm
- Firebase project with Firestore enabled
- Google OAuth credentials (optional)
- Render.com account (or similar platform)

## 🔧 Environment Setup

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Enable Firestore Database
4. Go to Project Settings → Service Accounts
5. Generate new private key
6. Save as `backend/serviceAccountKey.json`

### 2. Environment Variables

Create `.env` file in the backend directory:

```env
# Production Environment
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secure-jwt-secret-key-here
SESSION_SECRET=your-super-secure-session-secret-key-here

# Firebase Configuration (use environment variables in production)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account
FIREBASE_UNIVERSE_DOMAIN=googleapis.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# Security Settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
```

## 🚀 Deployment Options

### Option 1: Render.com (Recommended)

1. **Connect Repository**
   - Fork/clone this repository
   - Connect to Render.com
   - Create new Web Service

2. **Configure Build Settings**
   ```yaml
   Build Command: cd backend && npm install
   Start Command: cd backend && npm start
   ```

3. **Environment Variables**
   - Add all environment variables from `.env` file
   - Set `NODE_ENV=production`
   - Use Render's environment variable interface

4. **Deploy**
   - Render will automatically deploy on git push
   - Monitor build logs for any issues

### Option 2: Railway.app

1. **Connect Repository**
   - Connect your GitHub repository
   - Railway will auto-detect Node.js

2. **Environment Variables**
   - Add all required environment variables
   - Railway provides secure environment variable storage

3. **Deploy**
   - Railway automatically deploys on push
   - Provides custom domains

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

3. **Configure Buildpacks**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret
   # Add all other environment variables
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

## 🔒 Security Checklist

### Before Deployment

- [ ] Change default JWT secret
- [ ] Change default session secret
- [ ] Configure Firebase security rules
- [ ] Set up HTTPS redirects
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable security headers
- [ ] Configure file upload limits

### Firebase Security Rules

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Schools are publicly readable, admin writable
    match /schools/{schoolId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Reviews are publicly readable, authenticated users can write
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

```javascript
// Add to server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 2. Health Check Endpoint

```javascript
// Already implemented in server.js
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});
```

### 3. Error Monitoring

Consider integrating with:
- Sentry (error tracking)
- LogRocket (session replay)
- Google Analytics (user analytics)

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: |
        cd backend
        npm ci
        
    - name: Run tests
      run: |
        cd backend
        npm test
        
    - name: Deploy to Render
      env:
        RENDER_TOKEN: ${{ secrets.RENDER_TOKEN }}
        RENDER_SERVICE_ID: ${{ secrets.RENDER_SERVICE_ID }}
      run: |
        curl -X POST "https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys" \
          -H "Authorization: Bearer $RENDER_TOKEN" \
          -H "Content-Type: application/json"
```

## 🧪 Testing

### Run Tests Locally

```bash
cd backend
npm test
npm run test:watch
npm run test:coverage
```

### Test Production Build

```bash
# Build and test production version
npm run build
npm run test:prod
```

## 📈 Performance Optimization

### 1. Enable Compression

Already implemented with `compression` middleware.

### 2. Static File Caching

Already configured in server.js.

### 3. Database Optimization

- Add indexes to frequently queried fields
- Implement pagination for large datasets
- Use Firebase offline persistence

### 4. CDN Configuration

Consider using:
- Cloudflare for static assets
- Firebase Hosting for frontend
- AWS CloudFront for global distribution

## 🔧 Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Verify service account credentials
   - Check Firebase project permissions
   - Ensure Firestore is enabled

2. **CORS Errors**
   - Verify CORS_ORIGIN setting
   - Check frontend URL configuration
   - Test with Postman/curl

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Validate token format

4. **File Upload Issues**
   - Check upload directory permissions
   - Verify file size limits
   - Test with different file types

### Debug Commands

```bash
# Check environment variables
echo $NODE_ENV
echo $JWT_SECRET

# Test Firebase connection
node -e "require('./firestore').collection('test').get().then(() => console.log('Connected'))"

# Check server logs
tail -f logs/combined.log

# Test API endpoints
curl -X GET https://your-domain.com/api/health
```

## 📞 Support

For deployment issues:
1. Check the troubleshooting section
2. Review server logs
3. Test locally with production environment
4. Contact support with error details

## 🔄 Updates & Maintenance

### Regular Maintenance Tasks

- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Monitor performance metrics
- [ ] Backup Firebase data
- [ ] Review error logs
- [ ] Update SSL certificates

### Update Process

1. **Development**
   ```bash
   git checkout -b update-dependencies
   npm audit fix
   npm update
   npm test
   ```

2. **Testing**
   ```bash
   npm run test:coverage
   npm run lint
   npm run build
   ```

3. **Deployment**
   ```bash
   git push origin update-dependencies
   # Create PR and merge
   # Auto-deploy to production
   ```

---

**Happy Deploying! 🎉** 