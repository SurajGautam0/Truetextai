import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDk26B5i9XTm4R2jG-UWPLmbkbKvZCvCCw",
  authDomain: "truetextai-658fa.firebaseapp.com",
  projectId: "truetextai-658fa",
  storageBucket: "truetextai-658fa.firebasestorage.app",
  messagingSenderId: "997561903438",
  appId: "1:997561903438:web:6fdd5c803417940ed5161f",
  measurementId: "G-KF91ZKC5P0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  plan: 'free' | 'premium';
  createdAt: Date;
  lastLoginAt: Date;
}

// Authentication functions
export const signUpWithEmail = async (name: string, email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, { displayName: name });

    // Create user document in Firestore
    const userData: Omit<User, 'id'> = {
      name,
      email,
      role: 'user',
      plan: 'free',
      createdAt: new Date(),
      lastLoginAt: new Date()
    };

    try {
      await setDoc(doc(db, 'users', user.uid), userData);
    } catch (firestoreError: any) {
      console.error('Firestore error:', firestoreError);
      // If Firestore fails, still return user data but log the error
      if (firestoreError.message.includes('PERMISSION_DENIED') || firestoreError.message.includes('API has not been used')) {
        console.warn('Firestore not enabled. Please enable Firestore in Firebase Console.');
      }
    }

    return {
      id: user.uid,
      ...userData
    };
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters long.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else {
      throw new Error(error.message || 'Failed to create account.');
    }
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    try {
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        const userData: Omit<User, 'id'> = {
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'user',
          plan: 'free',
          createdAt: new Date(),
          lastLoginAt: new Date()
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        return {
          id: user.uid,
          ...userData
        };
      }

      const userData = userDoc.data() as Omit<User, 'id'>;

      // Update last login
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: new Date()
      });

      return {
        id: user.uid,
        ...userData
      };
    } catch (firestoreError: any) {
      console.error('Firestore error:', firestoreError);
      // If Firestore fails, return basic user data
      if (firestoreError.message.includes('PERMISSION_DENIED') || firestoreError.message.includes('API has not been used')) {
        console.warn('Firestore not enabled. Using basic user data.');
        return {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'user',
          plan: 'free',
          createdAt: new Date(),
          lastLoginAt: new Date()
        };
      }
      throw firestoreError;
    }
  } catch (error: any) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Invalid email or password.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    } else {
      throw new Error(error.message || 'Failed to sign in.');
    }
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    try {
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        // Create new user document
        const userData: Omit<User, 'id'> = {
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'user',
          plan: 'free',
          createdAt: new Date(),
          lastLoginAt: new Date()
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        return {
          id: user.uid,
          ...userData
        };
      } else {
        // Update last login for existing user
        const userData = userDoc.data() as Omit<User, 'id'>;
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: new Date()
        });

        return {
          id: user.uid,
          ...userData
        };
      }
    } catch (firestoreError: any) {
      console.error('Firestore error:', firestoreError);
      // If Firestore fails, return basic user data
      if (firestoreError.message.includes('PERMISSION_DENIED') || firestoreError.message.includes('API has not been used')) {
        console.warn('Firestore not enabled. Using basic user data.');
        return {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: 'user',
          plan: 'free',
          createdAt: new Date(),
          lastLoginAt: new Date()
        };
      }
      throw firestoreError;
    }
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked. Please allow popups for this site.');
    } else {
      throw new Error(error.message || 'Failed to sign in with Google.');
    }
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Admin functions
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersQuery = query(collection(db, 'users'));
    const querySnapshot = await getDocs(usersQuery);
    
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      } as User);
    });

    return users;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserRole = async (userId: string, role: 'user' | 'admin'): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), { role });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserPlan = async (userId: string, plan: 'free' | 'premium'): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), { plan });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return null;
    }

    return {
      id: userDoc.id,
      ...userDoc.data()
    } as User;
  } catch (error: any) {
    console.error('Error getting user by ID:', error);
    if (error.message.includes('PERMISSION_DENIED') || error.message.includes('API has not been used')) {
      throw new Error('Firestore is not enabled. Please enable Firestore in Firebase Console.');
    } else if (error.message.includes('client is offline')) {
      throw new Error('Unable to connect to database. Please check your internet connection.');
    } else {
      throw new Error('Failed to get user data.');
    }
  }
}; 