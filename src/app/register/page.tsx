'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KidForm } from '@/components/kids/kid-form';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function RegisterKidPage() {
  const [registered, setRegistered] = useState(false);

  return (
    <div className="relative min-h-svh overflow-hidden bg-background px-4 py-10">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <Logo />
          <h1 className="text-3xl font-bold tracking-tight">MightyKidz</h1>
          <p className="text-muted-foreground">Child Registration Form</p>
        </div>

        {registered ? (
          <div className="flex flex-col items-center gap-6 rounded-2xl border bg-card p-10 text-center shadow-xl">
            <CheckCircle2 className="h-16 w-16 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Registration Complete!</h2>
              <p className="mt-1 text-muted-foreground">
                The child has been successfully registered.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setRegistered(false)}>
                Register Another Child
              </Button>
              <Button variant="outline" asChild>
                <Link href="/login">Staff Login</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-6 shadow-xl sm:p-8">
            <h2 className="mb-1 text-xl font-semibold">Child Information</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Fill out the form below to register a child.
            </p>
            <KidForm onSuccess={() => setRegistered(true)} />
          </div>
        )}
      </div>
    </div>
  );
}
