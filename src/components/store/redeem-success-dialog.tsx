'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Kid, Gift } from '@/lib/types';
import { Confetti } from '@/components/confetti';
import { generateGiftRedemptionMessage } from '@/ai/flows/generate-gift-redemption-message';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

type Props = {
  kid: Kid;
  gift: Gift;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RedeemSuccessDialog({ kid, gift, open, onOpenChange }: Props) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      const getMessage = async () => {
        setIsLoading(true);
        try {
          const result = await generateGiftRedemptionMessage({
            kidName: kid.firstName,
            giftName: gift.name,
          });
          setMessage(result.message);
        } catch (error) {
          console.error('Error generating message:', error);
          setMessage(`Great job, ${kid.firstName}! You redeemed a ${gift.name}!`);
        }
        setIsLoading(false);
      };
      getMessage();

      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 6000); // Auto-close after 6 seconds

      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange, kid, gift]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-screen w-screen flex-col items-center justify-center border-0 bg-transparent shadow-none sm:h-auto sm:w-auto">
        {open && <Confetti />}
        <div className="relative flex flex-col items-center rounded-3xl bg-background/80 p-12 text-center backdrop-blur-lg">
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
            {isLoading ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            ) : (
                <h2 className="font-headline text-4xl font-bold leading-tight tracking-tighter md:text-5xl">
                    {message}
                </h2>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
