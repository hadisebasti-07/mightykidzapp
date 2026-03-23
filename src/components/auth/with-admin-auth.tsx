'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function withAdminAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithAdminAuth = (props: P) => {
    const { role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && role && role !== 'admin') {
        router.replace('/');
      }
    }, [role, loading, router]);

    if (loading || !role || role !== 'admin') {
      return (
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
  WithAdminAuth.displayName = `WithAdminAuth(${(WrappedComponent.displayName || WrappedComponent.name || 'Component')})`;
  return WithAdminAuth;
}
