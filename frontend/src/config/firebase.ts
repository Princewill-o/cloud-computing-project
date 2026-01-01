// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;