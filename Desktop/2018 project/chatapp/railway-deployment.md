# 🚂 Railway Deployment Guide for Chat Application

## Why Railway?
- Extremely simple deployment
- Free tier with good limits
- Automatic GitHub integration
- Built-in database hosting

## Step 1: Prepare Your App

### Add railway.json to root:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Step 2: Deploy to Railway

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select your chat app repository
5. Add MySQL database service
6. Set environment variables:
   - NODE_ENV=production
   - JWT_SECRET=your-secret-key
   - Database variables (auto-configured)

## Step 3: Access Your App

Railway will provide you with a URL like:
https://your-app-name.up.railway.app