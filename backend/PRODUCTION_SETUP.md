# Production Setup Guide for Schoolzy

This guide covers all the necessary steps to deploy Schoolzy on Render with proper production configuration.

## 🚀 Required Environment Variables

Set these environment variables in your Render dashboard:

### Core Application Variables
```bash
NODE_ENV=production
PORT=5000
```

### Security Variables
```bash
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
SESSION_SECRET=your-production-session-secret-key-change-this-in-production
```

### Firebase Configuration
```bash
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account-email%40your-project.iam.gserviceaccount.com
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

### Google OAuth (Optional)
```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/google/callback
```

## 🔧 How to Get Firebase Credentials

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**
3. **Go to Project Settings** (gear icon)
4. **Go to Service Accounts tab**
5. **Click "Generate new private key"**
6. **Download the JSON file**
7. **Extract the values** and set them as environment variables

## 🛠️ Render Deployment Steps

### 1. Connect Your Repository
- Connect your GitHub repository to Render
- Set the build command: `cd backend && npm install`
- Set the start command: `cd backend && npm start`

### 2. Set Environment Variables
- Go to your Render service dashboard
- Navigate to "Environment" tab
- Add all the environment variables listed above

### 3. Deploy
- Render will automatically deploy when you push to main
- Monitor the build logs for any issues

## ✅ Production Checklist

### Backend Configuration
- [ ] Trust proxy setting: `app.set('trust proxy', 1)`
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Security headers with Helmet
- [ ] Compression enabled
- [ ] Firebase session store configured
- [ ] All environment variables set

### Frontend Configuration
- [ ] API base URL uses relative paths (`/api`)
- [ ] Error handling for API calls
- [ ] Loading states implemented
- [ ] User-friendly error messages

### Database
- [ ] Firebase project configured
- [ ] Service account credentials set
- [ ] Schools data populated with coordinates
- [ ] Users collection accessible

## 🧪 Testing Production Setup

Run the production test script:
```bash
cd backend
node testProduction.js
```

This will test:
- ✅ Firebase connection
- ✅ Express app configuration
- ✅ Schools API functionality
- ✅ Environment variables
- ✅ CORS configuration

## 🔍 Troubleshooting

### Common Issues

1. **"ValidationError: The `X-Forwarded-For` header is set but Express `trust proxy` setting is false"**
   - ✅ **Fixed**: Added `app.set('trust proxy', 1)` before rate limiting

2. **"Error loading schools on map"**
   - ✅ **Fixed**: Updated frontend to handle correct API response structure
   - ✅ **Fixed**: Improved error handling and user feedback

3. **Login/Register buttons not working**
   - ✅ **Fixed**: Updated API base URL to use relative paths
   - ✅ **Fixed**: Added proper error handling

4. **CORS errors**
   - ✅ **Fixed**: Configured CORS for production domain
   - ✅ **Fixed**: Added proper origin handling

5. **Firebase connection issues**
   - ✅ **Fixed**: Environment-based Firebase configuration
   - ✅ **Fixed**: Proper service account setup

### Debug Commands

```bash
# Test Firebase connection
node testFirestore.js

# Test session store
node testSessionStore.js

# Test production setup
node testProduction.js

# Run all tests
npm test
```

## 📊 Monitoring

### Health Check Endpoint
Monitor your app health at: `https://your-app.onrender.com/api/health`

Response includes:
- Status
- Environment
- Trust proxy setting
- Timestamp

### Firebase Console
- Monitor Firestore usage
- Check session collection
- View real-time logs

### Render Dashboard
- Monitor build logs
- Check environment variables
- View deployment status

## 🔒 Security Best Practices

1. **Use strong secrets**: Generate random strings for JWT_SECRET and SESSION_SECRET
2. **Environment variables**: Never commit secrets to code
3. **HTTPS only**: Render provides HTTPS by default
4. **Rate limiting**: Prevents abuse
5. **Input validation**: All user inputs validated
6. **CORS**: Restrict origins to your domain only

## 🚀 Performance Optimization

1. **Compression**: Enabled for all responses
2. **Caching**: Static files cached for 1 day in production
3. **Database indexing**: Firebase automatically indexes common queries
4. **Session cleanup**: Run periodically to prevent bloat

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Run the production test script
3. Check Render build logs
4. Verify environment variables are set correctly
5. Test Firebase connection locally 