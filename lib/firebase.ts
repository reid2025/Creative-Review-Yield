// Firebase configuration
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyCap_nB0GGFPShkyndSkoHCYmC39Ykq92A",
  authDomain: "creative-review-yield.firebaseapp.com",
  projectId: "creative-review-yield",
  storageBucket: "creative-review-yield.firebasestorage.app",
  messagingSenderId: "1098754850633",
  appId: "1:1098754850633:web:211a057fd8759338816498",
  measurementId: "G-1HEL176862"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

export default app