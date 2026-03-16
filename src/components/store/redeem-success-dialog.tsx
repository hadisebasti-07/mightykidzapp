'use client';

import { useEffect, useRef } from 'react';
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
  successMessage: string;
  onDialogOpen: () => void;
};

export function RedeemSuccessDialog({ gift, open, onOpenChange, redemptionState, successMessage, onDialogOpen }: Props) {
  const hasTriggeredOpen = useRef(false);

  useEffect(() => {
    // When the dialog opens, trigger the redemption process in the parent
    if (open && !hasTriggeredOpen.current) {
      hasTriggeredOpen.current = true;
      onDialogOpen();
    }
    
    // Reset the flag when the dialog closes, so it can be triggered again next time
    if (!open) {
      hasTriggeredOpen.current = false;
    }
  }, [open, onDialogOpen]);

  useEffect(() => {
    // Auto-close after success message is shown
    if (open && redemptionState === 'success' && successMessage) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [open, redemptionState, successMessage, onOpenChange]);

  const isLoading = redemptionState === 'loading';
  const isSuccess = redemptionState === 'success';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-screen w-screen flex-col items-center justify-center border-0 bg-transparent shadow-none sm:h-auto sm:w-auto">
        {isSuccess && successMessage && <Confetti />}
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
                <div className="mt-6 min-h-[100px]">
                   { successMessage ? (
                      <h2 className="font-headline text-4xl font-bold leading-tight tracking-tighter md:text-5xl">
                          {successMessage}
                      </h2>
                    ) : (
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    )
                   }
                </div>
              </>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
