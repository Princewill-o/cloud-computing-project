# Firebase Database Setup Instructions

This guide will help you set up Firebase Firestore database for the AI Career Guide application.

## 1. Firebase Project Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `ai-career-guide` (or your preferred name)
4. Enable Google Analytics (optional but recommended)
5. Click "Create project"

### Step 2: Enable Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click "Enable" → Save
   - **Google**: Click "Enable" → Add your domain → Save
   - **GitHub**: Click "Enable" → Add OAuth App credentials → Save

### Step 3: Create Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (for development)
3. Select your preferred location (choose closest to your users)
4. Click "Done"

## 2. Database Structure

### Collections and Documents

#### 2.1 Users Collection (`users`)
```
users/
├── {userId}/
    ├── uid: string
    ├── email: string
    ├── displayName: string
    ├── photoURL?: string
    ├── createdAt: timestamp
    ├── lastLoginAt: timestamp
    ├── profileComplete: boolean
    ├── jobTitle?: string
    ├── location?: string
    ├── skills?: string[]
    ├── experience?: string
    ├── bio?: string
```

#### 2.2 CV Analysis Collection (`cvAnalyses`)
```
cvAnalyses/
├── {cvId}/
    ├── userId: string
    ├── filename: string
    ├── uploadedAt: timestamp
    ├── analysisStatus: string
    ├── extractedText: string
    ├── aiAnalysis: object
    ├── basicAnalysis: object
```

#### 2.3 Job Applications Collection (`jobApplications`)
```
jobApplications/
├── {applicationId}/
    ├── userId: string
    ├── jobTitle: string
    ├── company: string
    ├── appliedAt: timestamp
    ├── status: string
    ├── notes?: string
```

#### 2.4 User Activity Collection (`userActivity`)
```
userActivity/
├── {activityId}/
    ├── userId: string
    ├── action: string
    ├── timestamp: timestamp
    ├── metadata: object
```

## 3. Firestore Security Rules

### Step 1: Set Security Rules
1. Go to **Firestore Database** → **Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // CV analyses - users can only access their own
    match /cvAnalyses/{cvId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // Job applications - users can only access their own
    match /jobApplications/{applicationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
    
    // User activity - users can only access their own
    match /userActivity/{activityId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

3. Click **Publish**

## 4. Firestore Indexes

### Step 1: Create Composite Indexes
1. Go to **Firestore Database** → **Indexes**
2. Create the following indexes:

#### CV Analyses Index
- Collection: `cvAnalyses`
- Fields: 
  - `userId` (Ascending)
  - `uploadedAt` (Descending)

#### Job Applications Index
- Collection: `jobApplications`
- Fields:
  - `userId` (Ascending)
  - `appliedAt` (Descending)

#### User Activity Index
- Collection: `userActivity`
- Fields:
  - `userId` (Ascending)
  - `timestamp` (Descending)

## 5. Environment Configuration

### Step 1: Get Firebase Config
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click "Web app" icon (`</>`)
4. Register app name: `ai-career-guide-web`
5. Copy the config object

### Step 2: Update Environment Variables
Update your `frontend/.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 6. Initial Data Setup (Optional)

### Step 1: Create Sample Data
You can add sample data through the Firebase Console:

1. Go to **Firestore Database** → **Data**
2. Click "Start collection"
3. Collection ID: `users`
4. Add sample user document with your user ID

## 7. Testing the Setup

### Step 1: Test Authentication
1. Start your application: `npm run dev`
2. Try registering a new account
3. Check Firebase Console → **Authentication** → **Users**
4. Verify user appears in the list

### Step 2: Test Database Writes
1. Complete user registration
2. Edit your profile in the app
3. Check Firebase Console → **Firestore Database** → **Data**
4. Verify user document was created in `users` collection

### Step 3: Test CV Upload
1. Upload a CV in the profile section
2. Check that `cvAnalyses` collection is created
3. Verify CV analysis data is stored

## 8. Production Considerations

### Security Rules for Production
Before going to production, update security rules to be more restrictive:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // More restrictive rules for production
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId &&
        request.auth.token.email_verified == true;
    }
    
    // Add rate limiting and validation rules
    match /cvAnalyses/{cvId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId &&
        request.auth.token.email_verified == true;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId &&
        request.auth.token.email_verified == true &&
        // Limit CV uploads per day
        request.time > resource.data.lastUpload + duration.value(1, 'd');
    }
  }
}
```

### Backup Strategy
1. Enable automatic backups in Firebase Console
2. Set up Cloud Functions for data validation
3. Monitor usage and costs

## 9. Troubleshooting

### Common Issues

#### Authentication Not Working
- Check if authentication providers are enabled
- Verify environment variables are correct
- Check browser console for errors

#### Database Permission Denied
- Verify security rules are published
- Check if user is authenticated
- Ensure user ID matches in rules

#### Data Not Saving
- Check network connectivity
- Verify Firestore rules allow writes
- Check browser console for errors

### Debug Tools
1. Firebase Console → **Firestore Database** → **Usage**
2. Browser Developer Tools → **Network** tab
3. Firebase Console → **Authentication** → **Users**

## 10. Next Steps

After setup is complete:
1. Test all authentication flows
2. Verify profile editing works
3. Test CV upload and analysis
4. Monitor database usage
5. Set up monitoring and alerts

## Support

If you encounter issues:
1. Check [Firebase Documentation](https://firebase.google.com/docs)
2. Review [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
3. Check [Firebase Console](https://console.firebase.google.com/) for error logs