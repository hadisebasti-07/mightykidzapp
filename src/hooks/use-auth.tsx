'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onIdTokenChanged, User } from '@/lib/firebase/auth';
import { auth } from '@/lib/firebase/auth';
import { Loader2 } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        // Force refresh the token to get the latest claims.
        const tokenResult = await user.getIdTokenResult(true);
        console.log(
          '%cAuth State Changed:',
          'color: #28a745; font-weight: bold;',
          {
            uid: user.uid,
            email: user.email,
            claims: tokenResult.claims,
          }
        );

        if (tokenResult.claims.admin) {
          console.log(
            '%cAdmin claim is PRESENT on the token.',
            'color: #28a745;'
          );
        } else {
          console.warn(
            '%cAdmin claim is MISSING from the token. This user will not have admin rights.',
            'color: #ffc107;'
          );
        }
      } else {
        console.log(
          '%cAuth State Changed: No user is signed in.',
          'color: #dc3545;'
        );
      }
      setUser(user);
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
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);