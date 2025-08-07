# Firebase Setup Guide

This application now uses Firebase for real-time draft management, tracking, and persistent storage. Follow these steps to set up Firebase integration.

## 🚀 Quick Start

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or "Create a Project"
3. Enter your project name (e.g., "CRY-App-Tracker")
4. Enable Google Analytics (optional)
5. Click "Create Project"

### 2. Set up Firestore Database

1. In your Firebase project, navigate to **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development) or "Start in production mode" (for production)
4. Select a location for your database (choose closest to your users)

### 3. Set up Firebase Storage

1. Navigate to **Storage** in your Firebase console
2. Click "Get started"
3. Review security rules (default rules are fine for development)
4. Choose the same location as your Firestore database

### 4. Get Firebase Configuration

1. In your Firebase project, go to **Project Settings** (gear icon)
2. In the "General" tab, scroll down to "Your apps"
3. Click "Web" icon (</>) to add a web app
4. Register your app with a name (e.g., "CRY App")
5. Copy the configuration object - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789000",
  appId: "1:123456789000:web:abcdef123456"
};
```

### 5. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### 6. Update Firestore Security Rules

⚠️ **IMPORTANT**: Copy and paste these rules exactly in your Firebase Console:

1. Go to **Firestore Database** > **Rules** tab
2. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /drafts/{draftId} {
      allow read, write: if true; // DEVELOPMENT ONLY - allows all access
    }
  }
}
```

### 7. Update Storage Security Rules

⚠️ **IMPORTANT**: Copy and paste these rules exactly in your Firebase Console:

1. Go to **Storage** > **Rules** tab  
2. Replace the existing rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /draft-images/{allPaths=**} {
      allow read, write: if true; // DEVELOPMENT ONLY - allows all access
    }
  }
}
```

**✅ After updating both rules, click "Publish" in each tab.**

## 🔥 Firebase Features Integration

### Real-time Draft Management
- ✅ Auto-save drafts to Firestore every 30 seconds (as per tracker-deets.txt)
- ✅ Real-time sync across multiple browser tabs/windows
- ✅ Offline support with sync when back online
- ✅ Version tracking and conflict resolution

### Tracking Functionality
- ✅ Track AI-populated fields
- ✅ Auto-save vs manual save tracking
- ✅ Real-time usage statistics
- ✅ Draft lifecycle management

### Image Storage
- ✅ Upload images to Firebase Storage
- ✅ Automatic cleanup on draft deletion
- ✅ Optimized image URLs for fast loading

## 📊 Database Structure

### Drafts Collection

```javascript
{
  // Document ID (auto-generated)
  id: "draft_1704751255097_abc123",
  
  // User identification
  userId: "anonymous", // Replace with actual user ID in production
  
  // Draft metadata
  draftId: "draft_1704751255097_abc123",
  creativeFilename: "My Creative Campaign",
  lastSaved: Timestamp,
  createdAt: Timestamp,
  version: 1,
  isActive: true,
  autoSaved: true,
  
  // Form data
  formData: {
    // All form fields from single upload page
    creativeFilename: "string",
    designer: "string",
    campaignName: "string",
    // ... all other form fields
  },
  
  // Image storage
  imageUrl: "https://firebasestorage.googleapis.com/...",
  imageStoragePath: "draft-images/draft_123/image.jpg",
  
  // AI tracking
  aiPopulatedFields: ["designer", "headlineText", "ctaLabel"]
}
```

## 🔧 Development vs Production

### Development Setup
- Use test mode for Firestore and Storage
- Permissive security rules
- `userId: "anonymous"` for simplicity

### Production Setup
1. Enable Authentication (Firebase Auth)
2. Implement proper security rules
3. Update `userId` to use actual authenticated user IDs
4. Enable backup and monitoring
5. Set up proper indexes for queries

## 🛠️ Migration from Local Storage

The application automatically migrates existing localStorage drafts to Firebase on first load. This ensures no data is lost during the transition.

## 📱 Real-time Features

### Connection Status
- Visual indicators showing online/offline status
- Automatic retry when connection is restored
- Graceful degradation when offline

### Real-time Updates
- Drafts sync instantly across all open tabs
- Live tracking statistics
- Automatic conflict resolution

### Auto-save Timing
- Follows tracker-deets.txt requirements exactly:
  - 30-second countdown after image upload (if no typing)
  - Immediate updates after user types in any field
  - Console logging for verification
  - Real-time timestamp updates in UI

## 🚨 Troubleshooting

### Common Issues

1. **"Firebase not configured" error**
   - Check that `.env.local` exists and has correct values
   - Restart your development server after adding environment variables

2. **Permission denied errors**
   - Check Firestore and Storage security rules
   - Ensure your project ID matches in all configuration

3. **Images not uploading**
   - Verify Storage is enabled in Firebase Console
   - Check file size limits (10MB max in current implementation)

4. **Real-time updates not working**
   - Check browser console for connection errors
   - Verify Firestore rules allow read access

### Debug Mode

Enable detailed logging by adding to your environment:
```env
NEXT_PUBLIC_FIREBASE_DEBUG=true
```

## 🎯 Next Steps

1. **Set up Authentication**: Implement Firebase Auth for user management
2. **Analytics**: Add Firebase Analytics for usage tracking
3. **Performance**: Implement Firebase Performance Monitoring
4. **Hosting**: Deploy to Firebase Hosting for seamless integration

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Test with Firebase Console to ensure services are properly configured
4. Review security rules if getting permission errors

---

**🔥 Your Firebase-powered creative tracking app is ready to go!**

The application now provides:
- ✅ Real-time draft synchronization
- ✅ Persistent storage with automatic backup
- ✅ Cross-device compatibility
- ✅ Offline support with sync
- ✅ Advanced tracking and analytics
- ✅ Optimized performance with Firebase CDN