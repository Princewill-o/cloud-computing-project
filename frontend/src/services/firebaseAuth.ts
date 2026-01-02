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
  GithubAuthProvider,
  validatePassword
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
  jobTitle?: string;
  location?: string;
  skills?: string[];
  experience?: string;
  bio?: string;
}

class FirebaseAuthService {
  /**
   * Register a new user with email and password
   * Using Firebase's createUserWithEmailAndPassword method
   */
  async register(email: string, password: string, displayName: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed up successfully
        const user = userCredential.user;
        
        // Update the user's display name
        await updateProfile(user, {
          displayName: displayName
        });

        // Create user profile in Firestore
        await this.createUserProfile(user, { displayName });

        return userCredential;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Registration error:", errorCode, errorMessage);
        throw error;
      });
  }

  /**
   * Sign in with email and password
   * Using Firebase's signInWithEmailAndPassword method
   */
  async login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Signed in successfully
        const user = userCredential.user;
        
        // Update last login time
        await this.updateLastLogin(user.uid);
        
        return userCredential;
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Login error:", errorCode, errorMessage);
        throw error;
      });
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider)
      .then(async (userCredential) => {
        // Check if this is a new user and create profile if needed
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (!userDoc.exists()) {
          await this.createUserProfile(userCredential.user);
        } else {
          await this.updateLastLogin(userCredential.user.uid);
        }
        
        return userCredential;
      })
      .catch((error) => {
        console.error("Google sign-in error:", error);
        throw error;
      });
  }

  /**
   * Sign in with GitHub
   */
  async signInWithGitHub(): Promise<UserCredential> {
    const provider = new GithubAuthProvider();
    return signInWithPopup(auth, provider)
      .then(async (userCredential) => {
        // Check if this is a new user and create profile if needed
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (!userDoc.exists()) {
          await this.createUserProfile(userCredential.user);
        } else {
          await this.updateLastLogin(userCredential.user.uid);
        }
        
        return userCredential;
      })
      .catch((error) => {
        console.error("GitHub sign-in error:", error);
        throw error;
      });
  }

  /**
   * Sign out the current user
   * Using Firebase's signOut method
   */
  async logout(): Promise<void> {
    return signOut(auth)
      .then(() => {
        // Sign-out successful
        console.log("User signed out successfully");
      })
      .catch((error) => {
        // An error happened
        console.error("Logout error:", error);
        throw error;
      });
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    return sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log("Password reset email sent successfully");
      })
      .catch((error) => {
        console.error("Password reset error:", error);
        throw error;
      });
  }

  /**
   * Validate password against Firebase policy
   */
  async validatePassword(password: string): Promise<{
    isValid: boolean;
    containsLowercaseLetter?: boolean;
    containsUppercaseLetter?: boolean;
    containsNumericCharacter?: boolean;
    containsNonAlphanumericCharacter?: boolean;
    meetsMinPasswordLength?: boolean;
  }> {
    try {
      const status = await validatePassword(auth, password);
      
      if (!status.isValid) {
        // Password could not be validated. Use the status to show what
        // requirements are met and which are missing.
        
        // If a criterion is undefined, it is not required by policy. If the
        // criterion is defined but false, it is required but not fulfilled by
        // the given password.
        const needsLowerCase = status.containsLowercaseLetter !== true;
        const needsUpperCase = status.containsUppercaseLetter !== true;
        const needsNumeric = status.containsNumericCharacter !== true;
        const needsNonAlphanumeric = status.containsNonAlphanumericCharacter !== true;
        const needsMinLength = status.meetsMinPasswordLength !== true;
        
        console.log("Password validation failed:", {
          needsLowerCase,
          needsUpperCase,
          needsNumeric,
          needsNonAlphanumeric,
          needsMinLength
        });
      }
      
      return status;
    } catch (error) {
      console.error("Password validation error:", error);
      // Return basic validation if Firebase validation fails
      return {
        isValid: password.length >= 6,
        meetsMinPasswordLength: password.length >= 6
      };
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