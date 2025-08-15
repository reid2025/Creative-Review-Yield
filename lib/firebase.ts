// Firebase configuration
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
// App Check imports - keeping for future use
// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'
import { env } from './env'

const firebaseConfig = {
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId: env.firebase.messagingSenderId,
  appId: env.firebase.appId,
  measurementId: env.firebase.measurementId
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