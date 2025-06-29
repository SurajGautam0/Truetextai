# Firebase Authentication Setup

This project now uses Firebase for authentication, user management, and admin functionality.

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "truetextai")
4. Follow the setup wizard

### 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Enable the following sign-in methods:
   - Email/Password
   - Google

### 3. Set up Firestore Database

1. Go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users

### 4. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (</>)
4. Register your app with a nickname
5. Copy the configuration object

### 5. Environment Variables

Create a `.env.local` file in the `frontend` directory with your Firebase configuration:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. Firestore Security Rules

Update your Firestore security rules to allow authenticated users to read/write their own data and admins to access all data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Admins can read/write all user data
    match /users/{userId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### 7. Create Admin User

To create your first admin user:

1. Sign up normally through the app
2. Go to Firebase Console > Firestore Database
3. Find your user document in the `users` collection
4. Manually change the `role` field from `"user"` to `"admin"`

## Features

### Authentication

- Email/password signup and login
- Google OAuth sign-in
- Password reset functionality
- Automatic user creation in Firestore

### User Management

- User profiles with name, email, role, and plan
- Role-based access control (user/admin)
- Plan management (free/premium)

### Admin Features

- View all users
- Update user roles and plans
- Admin-only routes protection

## API Endpoints

- `GET /api/auth/me?uid={uid}` - Get user data by Firebase UID
- `GET /api/admin/users` - Get all users (admin only)
- `PATCH /api/admin/users` - Update user role/plan (admin only)

## Components

- `AuthProvider` - Firebase authentication context
- `AdminGuard` - Protects admin routes
- Updated login/signup pages with Firebase integration

## Migration Notes

The old authentication system (Redis-based) has been replaced with Firebase. All user data is now stored in Firestore, and authentication is handled by Firebase Auth.
