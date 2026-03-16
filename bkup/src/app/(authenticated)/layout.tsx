'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // Show nothing while loading or if user is not authenticated.
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
