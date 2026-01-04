# Firebase Deployment Setup Guide

This guide explains how to set up automated Firebase Hosting deployment with GitHub Actions.

## Current Status

✅ **Build Process**: Working correctly  
✅ **Firebase Configuration**: Properly configured  
⚠️ **Deployment**: Requires GitHub secrets setup  

## Quick Fix Options

### Option 1: Manual Deployment (Immediate)

Deploy manually from your local machine:

```bash
# Build the frontend
cd frontend
npm run build

# Deploy to Firebase Hosting
npx firebase deploy --only hosting --project cloudproject-22b3b
```

### Option 2: Set Up GitHub Secrets (Automated)

Choose one of these methods:

#### Method A: Firebase Token (Recommended)

1. **Generate Firebase CI Token**:
   ```bash
   npx firebase login:ci
   ```
   This will output a token like: `1//0GWGFmVBAeMgCgYIARAAGAwSNwF-L9Ir...`

2. **Add to GitHub Repository**:
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `FIREBASE_TOKEN`
   - Value: Paste the token from step 1

#### Method B: Service Account (Advanced)

1. **Create Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select project `cloudproject-22b3b`
   - Navigate to IAM & Admin → Service Accounts
   - Create new service account with Firebase Admin role
   - Generate and download JSON key

2. **Add to GitHub Repository**:
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT_CLOUDPROJECT_22B3B`
   - Value: Paste the entire JSON content

## Verification

After setting up secrets, push any change to trigger deployment:

```bash
git add .
git commit -m "test: trigger deployment"
git push origin main
```

Check the Actions tab in GitHub to see the deployment status.

## Current Deployment URL

The application is deployed at: https://cloudproject-22b3b.web.app

## Troubleshooting

### Build Warnings (Non-Critical)
- **Large chunks**: Consider code splitting for better performance
- **CJS API deprecated**: Will be resolved in future Vite updates
- **TypeScript config**: React Native config not found (doesn't affect build)

### Common Issues
- **Secret not found**: Ensure secret name matches exactly
- **Permission denied**: Service account needs Firebase Admin role
- **Token expired**: Regenerate Firebase CI token

## Manual Deployment Script

For convenience, you can use the existing deployment script:

```bash
./deploy.sh
```

This script builds and deploys the application locally.