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
  Settings,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { useEffect, useState } from 'react';
import { signOut } from '@/lib/firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { href: '/', label: 'Check-In', icon: ScanLine },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/kids', label: 'Kids', icon: Users },
  { href: '/store', label: 'Store', icon: Gift },
  { href: '/volunteers', label: 'Volunteers', icon: ClipboardList },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleLogout = async () => {
    try {
      await signOut();
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
      <SidebarHeader>
        <Logo />
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
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="gap-4">
        <Separator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex items-center gap-3 px-2">
          <Avatar className="size-9">
            <AvatarImage
              src="https://picsum.photos/seed/admin/100/100"
              alt="Admin"
            />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {user?.displayName || 'Admin User'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <SidebarMenuButton
            size="icon"
            variant="ghost"
            className="ml-auto size-8 shrink-0"
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
