'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onIdTokenChanged, User } from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/auth';
import { Loader2 } from 'lucide-react';

export type Role = 'admin' | 'welcomeIC' | 'multimediaIC' | null;

type AuthContextType = {
  user: User | null;
  loading: boolean;
  role: Role;
  isAdmin: boolean;
  isWelcomeIC: boolean;
  isMultimediaIC: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  isAdmin: false,
  isWelcomeIC: false,
  isMultimediaIC: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();

        if (tokenResult.claims.admin) {
          setRole('admin');
        } else if (tokenResult.claims.welcomeIC) {
          setRole('welcomeIC');
        } else if (tokenResult.claims.multimediaIC) {
          setRole('multimediaIC');
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
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        isAdmin: role === 'admin',
        isWelcomeIC: role === 'welcomeIC',
        isMultimediaIC: role === 'multimediaIC',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);