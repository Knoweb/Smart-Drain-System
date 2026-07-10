/**
 * FIREBASE CLIENT — src/lib/firebase.ts
 * ---------------------------------------------------------------------------
 * Single shared Firebase app instance for the entire web app.
 * Exports: app, auth, db (Realtime Database)
 *
 * WHY A SINGLE INSTANCE?
 * Initialising multiple Firebase apps wastes connections and can cause
 * auth state inconsistencies. This file exports ONE shared instance
 * that the entire app imports and reuses.
 */

import { initializeApp } from 'firebase/app'
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const app  = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db   = getDatabase(app)

// Fix for Edge/Incognito mode QuotaExceededError when IndexedDB is blocked
// Firebase Auth uses IndexedDB by default. We fall back to LocalStorage.
setPersistence(auth, browserLocalPersistence).catch(console.error)
