import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { firebaseConfig } from './config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Firebase auth service
const auth = getAuth(app);

export { auth, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User };
