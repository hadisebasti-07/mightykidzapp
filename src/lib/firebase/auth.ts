'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { firebaseConfig } from './config';

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get a reference to the Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, onAuthStateChanged, signInWithEmailAndPassword, signOut };
export type { User };
