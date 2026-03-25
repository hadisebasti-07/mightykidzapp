'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/auth';
import { Loader2 } from 'lucide-react';

export type Role = 'admin' | 'welcomeIC' | null;

type AuthContextType = {
  user: User | null;
  loading: boolean;
  role: Role;
  isAdmin: boolean;
  isWelcomeIC: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  isAdmin: false,
  isWelcomeIC: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        if (tokenResult.claims.admin) {
          setRole('admin');
        } else if (tokenResult.claims.welcomeIC) {
          setRole('welcomeIC');
        } else {
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, role, isAdmin: role === 'admin', isWelcomeIC: role === 'welcomeIC' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
