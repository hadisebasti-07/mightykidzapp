'use client';

import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth';
import { auth, db } from './firebase';

export { auth, db, onAuthStateChanged, signInWithEmailAndPassword, signOut };
export type { User };
