'use client';

import {
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth';
import { auth, db } from './firebase';

export { auth, db, onAuthStateChanged, onIdTokenChanged, signInWithEmailAndPassword, signOut };
export type { User };
