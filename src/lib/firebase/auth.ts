'use client';

import {
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth';
import { auth, db } from './firebase';

export { auth, db, onAuthStateChanged, onIdTokenChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };
export type { User };
