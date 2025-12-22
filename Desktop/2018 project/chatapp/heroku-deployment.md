# 🚀 Heroku Deployment Guide for Chat Application

## Step 1: Prepare for Heroku Deployment

### Install Heroku CLI
Download from: https://devcenter.heroku.com/articles/heroku-cli

### Login to Heroku
```bash
heroku login
```

## Step 2: Modify package.json for Heroku

Add these scripts to your root package.json:
```json
{
  "scripts": {
    "start": "node server.js",
    "heroku-postbuild": "cd client && npm install && npm run build"
  }
}
```

## Step 3: Create Heroku App
```bash
heroku create your-chat-app-name
```

## Step 4: Add Database
```bash
# Add MySQL database (ClearDB)
heroku addons:create cleardb:ignite

# Get database URL
heroku config:get CLEARDB_DATABASE_URL
```

## Step 5: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-here
```

## Step 6: Deploy
```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

## Step 7: Setup Database
```bash
# Run database setup
heroku run node setup-db.js
```

Your app will be available at: https://your-chat-app-name.herokuapp.com