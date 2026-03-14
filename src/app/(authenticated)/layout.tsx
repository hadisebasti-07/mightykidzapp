'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';
import { auth, signOut } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin) {
        signOut(auth).then(() => {
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'Only administrators can access this application.',
          });
          router.push('/login');
        });
      }
    }
  }, [user, isAdmin, loading, router, toast]);

  if (loading || !user || !isAdmin) {
    // Show nothing while loading or if user is not an authorized admin
    // The useEffect hook will handle redirection.
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex h-full min-h-svh flex-1 flex-col">
        <Header />
        <SidebarInset>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}
