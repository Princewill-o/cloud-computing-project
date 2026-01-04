# Firebase Database Setup Instructions

This guide will help you set up Firebase Firestore database for the AI Career Guide platform to store real user data instead of using mock data.

## Prerequisites

- Firebase project already created (cloudproject-22b3b)
- Firebase Authentication already configured
- Admin access to Firebase Console

## Step 1: Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `cloudproject-22b3b`
3. In the left sidebar, click on **Firestore Database**
4. Click **Create database**
5. Choose **Start in test mode** (for development)
6. Select your preferred location (choose closest to your users)
7. Click **Done**

## Step 2: Configure Firestore Security Rules

Replace the default rules with these production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // CVs - users can only access their own CVs
    match /cvs/{cvId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Job Applications - users can only access their own applications
    match /applications/{applicationId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
    
    // Analytics - users can only access their own analytics
    match /analytics/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // News articles - read-only for all authenticated users
    match /news/{articleId} {
      allow read: if request.auth != null;
    }
    
    // Job market data - read-only for all authenticated users
    match /job_market/{dataId} {
      allow read: if request.auth != null;
    }
  }
}
```

## Step 3: Enable Firebase Storage

1. In Firebase Console, go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode**
4. Select the same location as your Firestore database
5. Click **Done**

## Step 4: Configure Storage Security Rules

Replace the default storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // CV files - users can only upload/access their own CVs
    match /cvs/{fileName} {
      allow read, write: if request.auth != null && 
        fileName.matches('cv_' + request.auth.uid + '_.*');
    }
    
    // Profile pictures - users can only upload/access their own pictures
    match /profile_pictures/{fileName} {
      allow read, write: if request.auth != null && 
        fileName.matches('profile_' + request.auth.uid + '_.*');
    }
  }
}
```

## Step 5: Create Database Collections

The following collections will be automatically created when data is first written, but you can create them manually for better organization:

### Collections Structure:

1. **users** - User profiles and personal information
   ```
   users/{userId}
   ├── uid: string
   ├── email: string
   ├── name: string
   ├── jobTitle?: string
   ├── location?: string
   ├── bio?: string
   ├── skills: string[]
   ├── experience?: string
   ├── profilePicture?: string
   ├── createdAt: timestamp
   ├── updatedAt: timestamp
   └── profileCompleteness: number
   ```

2. **cvs** - CV files and analysis data
   ```
   cvs/{cvId}
   ├── userId: string
   ├── fileName: string
   ├── fileUrl: string
   ├── analysisStatus: string
   ├── uploadedAt: timestamp
   └── analysis?: object
   ```

3. **applications** - Job application tracking
   ```
   applications/{applicationId}
   ├── userId: string
   ├── jobId: string
   ├── jobTitle: string
   ├── company: string
   ├── appliedAt: timestamp
   ├── status: string
   └── notes?: string
   ```

4. **analytics** - User analytics and metrics
   ```
   analytics/{userId}
   ├── userId: string
   ├── profileViews: number
   ├── applicationsCount: number
   ├── skillsMatchScore: number
   ├── lastActive: timestamp
   └── careerLevel: string
   ```

## Step 6: Create Composite Indexes

For better query performance, create these indexes in Firestore:

1. Go to **Firestore Database** > **Indexes** tab
2. Click **Create Index**
3. Create the following indexes:

### CVs Collection Index:
- Collection ID: `cvs`
- Fields:
  - `userId` (Ascending)
  - `uploadedAt` (Descending)

### Applications Collection Index:
- Collection ID: `applications`
- Fields:
  - `userId` (Ascending)
  - `appliedAt` (Descending)

### Applications Status Index:
- Collection ID: `applications`
- Fields:
  - `userId` (Ascending)
  - `status` (Ascending)
  - `appliedAt` (Descending)

## Step 7: Update Environment Variables

Make sure your `.env` file in the frontend directory has the correct Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=cloudproject-22b3b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cloudproject-22b3b
VITE_FIREBASE_STORAGE_BUCKET=cloudproject-22b3b.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Step 8: Test Database Connection

1. Start your development server
2. Register a new user or login with existing account
3. Update your profile information
4. Upload a CV file
5. Check Firebase Console to verify data is being stored

## Step 9: Production Considerations

### Security Rules for Production:
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
    match /applications/{applicationId} {
      allow create: if request.auth != null && 
        request.resource.data.userId == request.auth.uid &&
        request.resource.data.keys().hasAll(['jobId', 'jobTitle', 'company']) &&
        request.resource.data.jobTitle is string &&
        request.resource.data.jobTitle.size() > 0;
    }
  }
}
```

### Backup Strategy:
1. Enable automatic backups in Firebase Console
2. Set up Cloud Functions for data validation
3. Implement data export functionality

### Monitoring:
1. Set up Firebase Performance Monitoring
2. Enable Firestore usage alerts
3. Monitor storage usage and costs

## Troubleshooting

### Common Issues:

1. **Permission Denied Errors**
   - Check security rules
   - Verify user authentication
   - Ensure user email is verified

2. **Index Errors**
   - Create required composite indexes
   - Wait for index creation to complete

3. **Storage Upload Failures**
   - Check storage security rules
   - Verify file size limits
   - Check network connectivity

### Testing Commands:

```bash
# Test Firestore connection
npm run test:firestore

# Test Storage upload
npm run test:storage

# Validate security rules
firebase emulators:start --only firestore
```

## Data Migration

If you have existing mock data, use this script to migrate to Firebase:

```javascript
// migration-script.js
import { firebaseService } from './src/services/firebaseService';

async function migrateUserData() {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  for (const user of users) {
    await firebaseService.saveUserProfile(user);
    console.log(`Migrated user: ${user.email}`);
  }
}

// Run migration
migrateUserData();
```

## Support

For additional help:
- [Firebase Documentation](https://firebase.google.com/docs/firestore)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)

---

**Note**: This setup provides a production-ready database structure for the AI Career Guide platform. All user data will be securely stored and properly isolated per user.