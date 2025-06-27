# Schoolzy Deployment Guide

## Quick Deploy Options

### Option 1: Render.com (Recommended - Free)

1. **Sign up for Render.com**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Connect your repository**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `Schoolzy` repository

3. **Configure the service**
   - **Name**: `schoolzy-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (deploy from root)

4. **Add Environment Variables**
   - Go to Environment → Environment Variables
   - Add these variables:
     ```
     NODE_ENV=production
     PORT=10000
     JWT_SECRET=your-super-secret-jwt-key-here
     CORS_ORIGIN=https://your-frontend-domain.com
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically deploy your app

### Option 2: Railway.app

1. **Sign up for Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy from GitHub**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your Schoolzy repository

3. **Configure**
   - Railway will auto-detect it's a Node.js app
   - Set the root directory to `backend`
   - Add environment variables in the Variables tab

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login and create app**
   ```bash
   heroku login
   heroku create schoolzy-app
   ```

3. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

4. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   ```

## Environment Variables Required

Create a `.env` file in the backend directory or set these in your deployment platform:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
CORS_ORIGIN=https://your-frontend-domain.com
```

## Firebase Configuration

Your Firebase service account key is already configured. For production:

1. **Keep your service account key secure**
   - Never commit it to public repositories
   - Use environment variables in production

2. **Firebase Security Rules**
   - Update your Firestore security rules
   - Enable authentication if needed

## Frontend Deployment

For the frontend, you can deploy to:
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set the root directory to `frontend`
4. Deploy

## Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify authentication works
- [ ] Check CORS configuration
- [ ] Test school search and filtering
- [ ] Verify map functionality
- [ ] Test user registration/login
- [ ] Check review system
- [ ] Update frontend API URLs to production

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update CORS_ORIGIN to your frontend domain
   - Check browser console for errors

2. **Firebase Connection Issues**
   - Verify service account key is correct
   - Check Firebase project settings

3. **Port Issues**
   - Make sure PORT environment variable is set
   - Check if port is available

4. **Static Files Not Loading**
   - Verify path to frontend directory
   - Check file permissions

## Support

If you encounter issues:
1. Check the deployment platform logs
2. Verify environment variables
3. Test locally first
4. Check Firebase console for errors 