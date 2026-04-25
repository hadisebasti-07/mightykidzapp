'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { Header } from '@/components/layout/header';

const ADMIN_ONLY_PATHS = ['/dashboard', '/kids', '/volunteers', '/store/manage', '/store/gift'];
const MULTIMEDIA_IC_ALLOWED_PATHS = ['/leaderboard', '/house-points'];

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (role === 'welcomeIC') {
      const restricted = ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
      if (restricted) router.push('/');
    }
    if (role === 'multimediaIC') {
      const allowed = MULTIMEDIA_IC_ALLOWED_PATHS.some((p) => pathname.startsWith(p));
      if (!allowed) router.push('/leaderboard');
    }
  }, [user, loading, role, router, pathname]);

  if (loading || !user) {
    return null;
  }

  if (!role) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 text-center p-8">
        <p className="text-lg font-semibold">Access Pending</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your account has not been assigned a role yet. Please contact an admin.
        </p>
      </div>
    );
  }

  if (role === 'welcomeIC') {
    const restricted = ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
    if (restricted) return null;
  }

  if (role === 'multimediaIC') {
    const allowed = MULTIMEDIA_IC_ALLOWED_PATHS.some((p) => pathname.startsWith(p));
    if (!allowed) return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex h-full min-h-svh flex-1 flex-col">
        <Header />
        <SidebarInset>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
