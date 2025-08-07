# Firebase Authentication Setup Guide

## Enable Authentication in Firebase Console

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: **creative-review-yield**

2. **Enable Authentication Service**
   - Click on **"Authentication"** in the left sidebar
   - Click **"Get started"** button if this is your first time
   - You'll be taken to the authentication dashboard

3. **Enable Email/Password Sign-in Method**
   - Go to the **"Sign-in method"** tab
   - Find **"Email/Password"** in the list of providers
   - Click on it to open settings
   - Toggle **"Enable"** for the first option (Email/Password)
   - Leave "Email link (passwordless sign-in)" disabled for now
   - Click **"Save"**

4. **Verify Firestore Rules (Optional but Recommended)**
   - Go to **"Firestore Database"** in the left sidebar
   - Click on the **"Rules"** tab
   - Update rules to secure user data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own drafts
    match /drafts/{document=**} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.userId == request.auth.uid || 
         request.auth.uid == request.resource.data.userId);
    }
    
    // Allow users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

5. **Test the Authentication**
   - Go back to your application
   - Navigate to `/register` to create a new account
   - After successful registration, you'll be redirected to `/upload/single`
   - Your drafts will now be saved with your user ID

## Troubleshooting

### Error: "auth/configuration-not-found"
- This means Authentication is not enabled in Firebase Console
- Follow steps 1-3 above to enable it

### Error: "auth/project-not-found"
- Your Firebase configuration might be incorrect
- Verify the config in `/lib/firebase.ts` matches your Firebase project

### Error: "auth/network-request-failed"
- Check your internet connection
- Verify Firebase services are not blocked by firewall/proxy

## Features Implemented

✅ User Registration with username, email, and password
✅ User Login with email and password
✅ Protected routes (redirects to login if not authenticated)
✅ User-specific draft storage
✅ Automatic association of drafts with logged-in user
✅ Real-time draft syncing per user

## Next Steps

After enabling authentication, you can:
1. Add password reset functionality
2. Add social login providers (Google, Facebook, etc.)
3. Add email verification
4. Add user profile management