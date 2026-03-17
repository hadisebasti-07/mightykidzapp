'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center p-1', className)}>
      <Image
        src="/logo.png"
        alt="MightyKidz Logo"
        width={135}
        height={113}
        className="h-12 w-auto"
        priority
      />
    </div>
  );
}
