import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border/60 bg-background/90 px-4 backdrop-blur-md md:px-6',
        className
      )}
    >
      <SidebarTrigger className="shrink-0 text-muted-foreground hover:text-foreground" />

      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search kids, gifts..."
          className="h-9 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:w-[220px] lg:w-[300px]"
        />
      </div>
    </header>
  );
}
