// Firebase configuration
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

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

// App Check disabled - codecode2025 is not a valid reCAPTCHA key
// To enable App Check:
// 1. Go to https://www.google.com/recaptcha/admin
// 2. Create a new reCAPTCHA v3 site
// 3. Replace 'YOUR-SITE-KEY' below with your actual site key
// 4. OR disable App Check enforcement in Firebase Console for Vertex AI
/*
if (typeof window !== 'undefined') {
  try {
    const appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('YOUR-SITE-KEY'),
      isTokenAutoRefreshEnabled: true
    })
    console.log('🔐 App Check initialized')
  } catch (error) {
    console.log('⚠️ App Check initialization error:', error)
  }
}
*/

// Initialize Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

export default app