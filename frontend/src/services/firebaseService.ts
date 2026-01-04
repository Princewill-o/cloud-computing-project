/**
 * Firebase Database Service for real data persistence
 */
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import app from '../config/firebase';

const db = getFirestore(app);
const storage = getStorage(app);

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  jobTitle?: string;
  location?: string;
  bio?: string;
  skills: string[];
  experience?: string;
  profilePicture?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  profileCompleteness: number;
}

export interface CVData {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  analysisStatus: 'pending' | 'completed' | 'failed';
  uploadedAt: Timestamp;
  analysis?: {
    skills: string[];
    experience: string;
    summary: string;
  };
}

export interface JobApplication {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedAt: Timestamp;
  status: 'applied' | 'viewed' | 'interview' | 'rejected' | 'offer';
  notes?: string;
}

export interface UserAnalytics {
  userId: string;
  profileViews: number;
  applicationsCount: number;
  skillsMatchScore: number;
  lastActive: Timestamp;
  careerLevel: string;
}

class FirebaseService {
  /**
   * Create or update user profile
   */
  async saveUserProfile(profile: Partial<UserProfile>): Promise<void> {
    if (!profile.uid) throw new Error('User ID is required');
    
    const userRef = doc(db, 'users', profile.uid);
    const now = serverTimestamp();
    
    const profileData = {
      ...profile,
      updatedAt: now,
      profileCompleteness: this.calculateCompleteness(profile)
    };

    // Check if user exists
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      await updateDoc(userRef, profileData);
    } else {
      await setDoc(userRef, {
        ...profileData,
        createdAt: now
      });
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { uid, ...userDoc.data() } as UserProfile;
    }
    return null;
  }

  /**
   * Upload CV file and save metadata
   */
  async uploadCV(uid: string, file: File): Promise<CVData> {
    // Upload file to Firebase Storage
    const fileName = `cv_${uid}_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `cvs/${fileName}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const fileUrl = await getDownloadURL(snapshot.ref);
    
    // Save CV metadata to Firestore
    const cvData: Omit<CVData, 'id'> = {
      userId: uid,
      fileName: file.name,
      fileUrl,
      analysisStatus: 'pending',
      uploadedAt: serverTimestamp() as Timestamp
    };
    
    const cvRef = await addDoc(collection(db, 'cvs'), cvData);
    
    return {
      id: cvRef.id,
      ...cvData,
      uploadedAt: Timestamp.now()
    };
  }

  /**
   * Get user's CV data
   */
  async getUserCV(uid: string): Promise<CVData | null> {
    const q = query(
      collection(db, 'cvs'),
      where('userId', '==', uid),
      orderBy('uploadedAt', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CVData;
    }
    return null;
  }

  /**
   * Track job application
   */
  async trackJobApplication(application: Omit<JobApplication, 'id'>): Promise<string> {
    const appRef = await addDoc(collection(db, 'applications'), {
      ...application,
      appliedAt: serverTimestamp()
    });
    
    // Update user analytics
    await this.updateUserAnalytics(application.userId, {
      applicationsCount: 1
    });
    
    return appRef.id;
  }

  /**
   * Get user's job applications
   */
  async getUserApplications(uid: string): Promise<JobApplication[]> {
    const q = query(
      collection(db, 'applications'),
      where('userId', '==', uid),
      orderBy('appliedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as JobApplication[];
  }

  /**
   * Update user analytics
   */
  async updateUserAnalytics(uid: string, updates: Partial<UserAnalytics>): Promise<void> {
    const analyticsRef = doc(db, 'analytics', uid);
    const analyticsDoc = await getDoc(analyticsRef);
    
    if (analyticsDoc.exists()) {
      const currentData = analyticsDoc.data() as UserAnalytics;
      await updateDoc(analyticsRef, {
        ...updates,
        profileViews: updates.profileViews ? 
          (currentData.profileViews || 0) + updates.profileViews : 
          currentData.profileViews,
        applicationsCount: updates.applicationsCount ? 
          (currentData.applicationsCount || 0) + updates.applicationsCount : 
          currentData.applicationsCount,
        lastActive: serverTimestamp()
      });
    } else {
      await setDoc(analyticsRef, {
        userId: uid,
        profileViews: updates.profileViews || 0,
        applicationsCount: updates.applicationsCount || 0,
        skillsMatchScore: updates.skillsMatchScore || 0,
        careerLevel: updates.careerLevel || 'Entry Level',
        lastActive: serverTimestamp()
      });
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(uid: string): Promise<UserAnalytics | null> {
    const analyticsRef = doc(db, 'analytics', uid);
    const analyticsDoc = await getDoc(analyticsRef);
    
    if (analyticsDoc.exists()) {
      return { userId: uid, ...analyticsDoc.data() } as UserAnalytics;
    }
    return null;
  }

  /**
   * Listen to real-time updates for user profile
   */
  subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void): () => void {
    const userRef = doc(db, 'users', uid);
    return onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        callback({ uid, ...doc.data() } as UserProfile);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Calculate profile completeness
   */
  private calculateCompleteness(profile: Partial<UserProfile>): number {
    let completeness = 0;
    const fields = [
      { field: 'name', weight: 15 },
      { field: 'email', weight: 10 },
      { field: 'jobTitle', weight: 15 },
      { field: 'location', weight: 10 },
      { field: 'bio', weight: 15 },
      { field: 'skills', weight: 20, isArray: true },
      { field: 'experience', weight: 15 }
    ];

    fields.forEach(({ field, weight, isArray }) => {
      const value = (profile as any)[field];
      if (isArray ? (value && value.length > 0) : (value && value.trim())) {
        completeness += weight;
      }
    });

    return Math.min(completeness, 100);
  }
}

export const firebaseService = new FirebaseService();