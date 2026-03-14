import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6',
        className
      )}
    >
      <SidebarTrigger className="md:hidden" />
      <div className="flex w-full items-center gap-4">
        {/* Can add page title or breadcrumbs here */}
      </div>

      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-secondary pl-8 h-9 md:w-[200px] lg:w-[320px] text-sm"
        />
      </div>

      <Button variant="ghost" size="icon" className="rounded-full">
        {/* User menu can go here */}
      </Button>
    </header>
  );
}
