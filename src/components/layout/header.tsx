import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function Header({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border/50 bg-background/95 px-4 backdrop-blur-md md:px-6',
        className
      )}
    >
      <SidebarTrigger className="shrink-0 text-muted-foreground hover:text-foreground" />
    </header>
  );
}
