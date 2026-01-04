#!/bin/bash

# AI Career Guide - Firebase Deployment Script

echo "🚀 Starting deployment process..."

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Deploy to Firebase Hosting
echo "🔥 Deploying to Firebase Hosting..."
npx firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://cloudproject-22b3b.web.app"