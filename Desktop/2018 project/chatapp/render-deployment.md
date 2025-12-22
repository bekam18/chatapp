# 🌐 Render Deployment Guide for Chat Application

## Why Render?
- Free tier available
- Automatic deployments from GitHub
- Built-in database hosting
- Easy SSL certificates

## Step 1: Prepare Your App

### Create render.yaml in root directory:
```yaml
services:
  - type: web
    name: chat-app
    env: node
    buildCommand: npm install && cd client && npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: DB_HOST
        fromDatabase:
          name: chat-db
          property: host
      - key: DB_USER
        fromDatabase:
          name: chat-db
          property: user
      - key: DB_PASSWORD
        fromDatabase:
          name: chat-db
          property: password
      - key: DB_NAME
        fromDatabase:
          name: chat-db
          property: database

databases:
  - name: chat-db
    databaseName: chat_app
    user: chatuser
```

## Step 2: Deploy to Render

1. Go to https://render.com
2. Sign up with GitHub
3. Connect your repository
4. Choose "Blueprint" deployment
5. Select your render.yaml file
6. Deploy!

Your app will be available at: https://your-app-name.onrender.com