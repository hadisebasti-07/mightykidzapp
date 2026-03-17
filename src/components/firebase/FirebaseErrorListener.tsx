'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/lib/firebase/errors';

export function FirebaseErrorListener({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // The Next.js dev overlay will pick this up.
      console.error(error); 
      
      toast({
        variant: 'destructive',
        title: 'Permission Error',
        description: 'An operation was blocked by security rules. Check the dev console for details.',
        duration: 10000,
      });
    };

    errorEmitter.on('permission-error', handleError);

    // Note: No cleanup function is returned. 
    // The listener should persist for the lifetime of the app.
  }, [toast]);

  return <>{children}</>;
}
