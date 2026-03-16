import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center', className)}>
      <Image
        src="/logo.png"
        alt="MightyKidz Logo"
        width={135}
        height={113}
        className="h-10 w-auto"
        priority
      />
    </div>
  );
}
