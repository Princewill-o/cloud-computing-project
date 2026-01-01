import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  UserCredential,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
  profileComplete: boolean;
  skills?: string[];
  experience?: string;
  location?: string;
  jobTitle?: string;
}

class FirebaseAuthService {
  /**
   * Register a new user with email and password
   */
  async register(email: string, password: string, displayName: string): Promise<UserCredential> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      // Create user profile in Firestore
      await this.createUserProfile(userCredential.user, { displayName });

      return userCredential;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  /**
   * Sign in with email and password
   */
  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time
      await this.updateLastLogin(userCredential.user.uid);
      
      return userCredential;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<UserCredential> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if this is a new user and create profile if needed
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (!userDoc.exists()) {
        await this.createUserProfile(userCredential.user);
      } else {
        await this.updateLastLogin(userCredential.user.uid);
      }
      
      return userCredential;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  }

  /**
   * Sign in with GitHub
   */
  async signInWithGitHub(): Promise<UserCredential> {
    try {
      const provider = new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Check if this is a new user and create profile if needed
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (!userDoc.exists()) {
        await this.createUserProfile(userCredential.user);
      } else {
        await this.updateLastLogin(userCredential.user.uid);
      }
      
      return userCredential;
    } catch (error) {
      console.error("GitHub sign-in error:", error);
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  }

  /**
   * Create user profile in Firestore
   */
  private async createUserProfile(user: User, additionalData?: any): Promise<void> {
    try {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: additionalData?.displayName || user.displayName || "",
        photoURL: user.photoURL || undefined,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileComplete: false,
        ...additionalData
      };

      await setDoc(doc(db, "users", user.uid), userProfile);
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  }

  /**
   * Update last login time
   */
  private async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, "users", uid), {
        lastLoginAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating last login:", error);
    }
  }

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, "users", uid), data);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  /**
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }
}

export const firebaseAuthService = new FirebaseAuthService();