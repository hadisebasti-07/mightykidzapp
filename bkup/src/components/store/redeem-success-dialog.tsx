'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Gift } from '@/lib/types';
import { Confetti } from '@/components/confetti';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

type Props = {
  gift: Gift;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redemptionState: 'idle' | 'loading' | 'success' | 'error';
};

export function RedeemSuccessDialog({ gift, open, onOpenChange, redemptionState }: Props) {
  useEffect(() => {
    // Auto-close after success
    if (open && redemptionState === 'success') {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [open, redemptionState, onOpenChange]);

  const isLoading = redemptionState === 'loading';
  const isSuccess = redemptionState === 'success';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-screen w-screen flex-col items-center justify-center border-0 bg-transparent shadow-none sm:h-auto sm:w-auto">
        {isSuccess && <Confetti />}
        <div className="relative flex flex-col items-center rounded-3xl bg-background/80 p-12 text-center backdrop-blur-lg">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Processing redemption...</p>
            </div>
          ) : (
            isSuccess && (
              <>
                <div className="relative h-48 w-48 -mt-24">
                  <Image 
                    src={gift.imageUrl}
                    alt={gift.name}
                    width={192}
                    height={192}
                    className="rounded-full border-8 border-background object-cover shadow-lg aspect-square"
                  />
                </div>
                <div className="mt-6 min-h-[100px] flex flex-col items-center justify-center">
                    <h2 className="font-headline text-4xl font-bold leading-tight tracking-tighter md:text-5xl">
                        Success!
                    </h2>
                    <p className="mt-2 text-lg text-muted-foreground">Enjoy your new {gift.name}!</p>
                </div>
              </>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
