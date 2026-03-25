'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import {
  LayoutDashboard,
  Users,
  ScanLine,
  Gift,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { useEffect, useState } from 'react';
import { signOut, auth } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const adminNavItems = [
  { href: '/', label: 'Check-In', icon: ScanLine },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kids', label: 'Kids', icon: Users },
  { href: '/store', label: 'Store', icon: Gift },
  { href: '/volunteers', label: 'Volunteers', icon: ClipboardList },
];

const welcomeICNavItems = [
  { href: '/', label: 'Check-In', icon: ScanLine },
  { href: '/store', label: 'Store', icon: Gift },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ Single source of truth
  const navItems =
    role === 'welcomeIC'
      ? welcomeICNavItems
      : role === 'admin'
      ? adminNavItems
      : [];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'There was a problem logging you out.',
      });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col items-center gap-2 pb-4 pt-3 text-center">
        <Logo />
        <div className="flex flex-col">
          <h2 className="text-xl font-bold tracking-tighter text-sidebar-foreground">
            MightyKidz
          </h2>
          <p className="text-xs text-sidebar-foreground/50">
            Ministry Management
          </p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive =
              mounted &&
              (item.href === '/'
                ? pathname === item.href
                : pathname.startsWith(item.href));

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={!!isActive}
                  tooltip={item.label}
                  className="h-11 text-base"
                >
                  <Link href={item.href}>
                    <item.icon className="size-5" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="gap-3 pb-4">
        <Separator className="opacity-20" />

        <div className="flex items-center gap-3 px-2 py-1">
          <Avatar className="size-9 ring-2 ring-sidebar-primary/40">
            <AvatarImage
              src="https://picsum.photos/seed/admin/100/100"
              alt="User"
            />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-bold">
              {role === 'admin' ? 'AD' : 'WI'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {user?.displayName ||
                (role === 'admin' ? 'Admin User' : 'Welcome IC')}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/50">
              {role === 'admin' ? 'Administrator' : 'Welcome IC'}
            </p>
          </div>

          <SidebarMenuButton
            size="icon"
            variant="ghost"
            className="ml-auto size-8 shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground"
            tooltip="Log Out"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}