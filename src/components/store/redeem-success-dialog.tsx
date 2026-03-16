'use client';

import { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Kid, Gift } from '@/lib/types';
import { Confetti } from '@/components/confetti';
import { generateGiftRedemptionMessage } from '@/ai/flows/generate-gift-redemption-message';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { redeemGift } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

type Props = {
  kid: Kid;
  gift: Gift;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRedemptionComplete: () => void;
};

export function RedeemSuccessDialog({ kid, gift, open, onOpenChange, onRedemptionComplete }: Props) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const redemptionInitiated = useRef(false);

  useEffect(() => {
    if (open && !redemptionInitiated.current) {
      redemptionInitiated.current = true;
      const performRedemption = async () => {
        setIsLoading(true);
        setMessage(''); // Reset message
        try {
          await redeemGift(kid.id, gift.id);

          // After successful DB transaction, generate fun message
          const result = await generateGiftRedemptionMessage({
            kidName: kid.firstName,
            giftName: gift.name,
          });
          setMessage(result.message);
          onRedemptionComplete();

        } catch (error: any) {
          console.error('Error during redemption:', error);
          toast({
            variant: 'destructive',
            title: 'Redemption Failed',
            description: error.message || 'There was an issue processing the redemption.',
          });
          onOpenChange(false); // Close dialog on error
        } finally {
          setIsLoading(false);
        }
      };

      performRedemption();
    } else if (!open) {
      redemptionInitiated.current = false; // Reset when dialog closes
    }
  }, [open, kid, gift, onOpenChange, toast, onRedemptionComplete]);

  useEffect(() => {
    // Auto-close after success message is shown
    if (open && !isLoading && message) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [open, isLoading, message, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-screen w-screen flex-col items-center justify-center border-0 bg-transparent shadow-none sm:h-auto sm:w-auto">
        {open && !isLoading && message && <Confetti />}
        <div className="relative flex flex-col items-center rounded-3xl bg-background/80 p-12 text-center backdrop-blur-lg">
          {isLoading ? (
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          ) : (
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
              <div className="mt-6">
                <h2 className="font-headline text-4xl font-bold leading-tight tracking-tighter md:text-5xl">
                    {message}
                </h2>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
