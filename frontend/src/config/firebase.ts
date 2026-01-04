// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDowurbYQjV55Ox-Gid8JzpgrkfugU51U8",
  authDomain: "cloudproject-22b3b.firebaseapp.com",
  projectId: "cloudproject-22b3b",
  storageBucket: "cloudproject-22b3b.firebasestorage.app",
  messagingSenderId: "39239274386",
  appId: "1:39239274386:web:593da94b50acc985c67b4b",
  measurementId: "G-WZ8GJHXJSY"
};

// Validate that all required environment variables are present
const requiredEnvVars = [
  'apiKey',
  'authDomain', 
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
];

const missingEnvVars = requiredEnvVars.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingEnvVars.length > 0) {
  console.warn(`Missing required Firebase config: ${missingEnvVars.join(', ')}`);
  console.warn('Firebase features may not work properly.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set up authentication persistence - users stay signed in
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Error setting auth persistence:', error);
});

// Enable offline persistence for better performance
auth.settings.appVerificationDisabledForTesting = false;

// Only initialize analytics in production and if measurement ID is available
export const analytics = firebaseConfig.measurementId 
  ? getAnalytics(app) 
  : null;

export default app;