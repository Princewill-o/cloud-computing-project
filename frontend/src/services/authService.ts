/**
 * Firebase Authentication service
 */
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  full_name?: string;
  name?: string | null; // Alias for displayName
  jobTitle?: string;
  location?: string;
  skills?: string[];
  experience?: string;
  bio?: string;
  profilePicture?: string;
  photoURL?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // Set up auth state listener
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        this.currentUser = await this.createUserFromFirebaseUser(firebaseUser);
      } else {
        this.currentUser = null;
      }
    });
  }

  private async createUserFromFirebaseUser(firebaseUser: FirebaseUser): Promise<User> {
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.data();

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || null,
      name: firebaseUser.displayName || null,
      full_name: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || undefined,
      profilePicture: firebaseUser.photoURL || undefined,
      createdAt: userData?.createdAt,
      lastLoginAt: new Date().toISOString(),
      ...userData // Include any additional data from Firestore
    };
  }

  async register(data: RegisterRequest): Promise<User> {
    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      );

      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: data.displayName
      });

      // Create user document in Firestore
      const userData = {
        uid: userCredential.user.uid,
        email: data.email,
        displayName: data.displayName,
        full_name: data.displayName,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileComplete: false
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // Return the user object
      return await this.createUserFromFirebaseUser(userCredential.user);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      }
      
      throw new Error(error.message || 'Registration failed');
    }
  }

  async login(data: LoginRequest): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        data.email, 
        data.password
      );

      // Update last login time in Firestore
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLoginAt: new Date().toISOString()
      });

      return await this.createUserFromFirebaseUser(userCredential.user);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later');
      }
      
      throw new Error(error.message || 'Login failed');
    }
  }

  async loginWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Create or update user document in Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create new user document
        const userData = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          full_name: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          profileComplete: false,
          provider: 'google'
        };
        await setDoc(userRef, userData);
      } else {
        // Update last login time
        await updateDoc(userRef, {
          lastLoginAt: new Date().toISOString()
        });
      }

      return await this.createUserFromFirebaseUser(userCredential.user);
    } catch (error: any) {
      console.error('Google login error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Login cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked. Please allow popups and try again');
      }
      
      throw new Error(error.message || 'Google login failed');
    }
  }

  async loginWithGitHub(): Promise<User> {
    try {
      const provider = new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Create or update user document in Firestore
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create new user document
        const userData = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          full_name: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          profileComplete: false,
          provider: 'github'
        };
        await setDoc(userRef, userData);
      } else {
        // Update last login time
        await updateDoc(userRef, {
          lastLoginAt: new Date().toISOString()
        });
      }

      return await this.createUserFromFirebaseUser(userCredential.user);
    } catch (error: any) {
      console.error('GitHub login error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Login cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked. Please allow popups and try again');
      }
      
      throw new Error(error.message || 'GitHub login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      }
      
      throw new Error(error.message || 'Password reset failed');
    }
  }

  async updateUserProfile(data: Partial<User>): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      // Update Firebase Auth profile if display name or photo changed
      if (data.displayName || data.photoURL) {
        await updateProfile(auth.currentUser, {
          displayName: data.displayName || auth.currentUser.displayName,
          photoURL: data.photoURL || auth.currentUser.photoURL
        });
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        ...data,
        updatedAt: new Date().toISOString()
      });

      // Update current user
      if (this.currentUser) {
        this.currentUser = { ...this.currentUser, ...data };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  // Get the current Firebase user
  getFirebaseUser() {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.createUserFromFirebaseUser(firebaseUser);
        callback(user);
      } else {
        callback(null);
      }
    });
  }

  // Helper method to get authorization headers (for API calls)
  async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Error getting ID token:', error);
      }
    }

    return headers;
  }
}

export const authService = new AuthService();