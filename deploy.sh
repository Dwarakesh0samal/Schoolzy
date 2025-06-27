#!/bin/bash

echo "🚀 Schoolzy Deployment Script"
echo "=============================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote origin found. Please add your GitHub repository:"
    echo "   git remote add origin <your-github-repo-url>"
    exit 1
fi

echo "✅ Git repository configured"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy Schoolzy app"
git push origin main

echo ""
echo "🎉 Code pushed to GitHub!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://render.com"
echo "2. Sign up/Login with GitHub"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Connect your Schoolzy repository"
echo "5. Configure:"
echo "   - Name: schoolzy-backend"
echo "   - Environment: Node"
echo "   - Build Command: cd backend && npm install"
echo "   - Start Command: cd backend && npm start"
echo "6. Add Environment Variables:"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - JWT_SECRET=your-secret-key"
echo "7. Click 'Create Web Service'"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🌐 Your app will be available at: https://your-app-name.onrender.com" 