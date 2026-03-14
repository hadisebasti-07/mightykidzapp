'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Kid } from '@/lib/types';
import { Confetti } from '@/components/confetti';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { generatePersonalizedCheckinMessage } from '@/ai/flows/generate-personalized-checkin-message';
import { Loader2, Sparkles } from 'lucide-react';

type Props = {
  kid: Kid;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CheckInSuccessDialog({ kid, open, onOpenChange }: Props) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (open) {
      const getMessage = async () => {
        setIsLoading(true);
        const isBirthday = new Date().getMonth() + 1 === kid.birthdayMonth && new Date().getDate() === new Date(kid.dateOfBirth).getDate();
        try {
          const result = await generatePersonalizedCheckinMessage({
            kidName: kid.firstName,
            isBirthday: isBirthday,
          });
          setMessage(result);
        } catch (error) {
          console.error('Error generating message:', error);
          setMessage(`Welcome, ${kid.firstName}! We're so glad you're here!`);
        }
        setIsLoading(false);
      };
      getMessage();

      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange, kid]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-screen w-screen flex-col items-center justify-center border-0 bg-transparent shadow-none sm:h-auto sm:w-auto">
        {open && <Confetti />}
        <div className="relative flex flex-col items-center rounded-3xl bg-background/80 p-12 text-center backdrop-blur-lg">
          <Avatar className="h-40 w-40 border-8 border-background shadow-lg">
            <AvatarImage src={kid.photoUrl} alt={kid.firstName} />
            <AvatarFallback className="text-6xl">
              {kid.firstName.charAt(0)}
              {kid.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="mt-6">
            {isLoading ? (
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            ) : (
                <h2 className="font-headline text-4xl font-bold leading-tight tracking-tighter md:text-5xl">
                    {message}
                </h2>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-lg font-semibold text-primary-foreground">
              <Sparkles className="size-5 text-primary"/>
              <span>+10 Coins Earned!</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
