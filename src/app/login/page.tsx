
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, signInWithEmailAndPassword } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      // Force token refresh so custom claims (admin / welcomeIC) are picked up immediately
      await user.getIdToken(true);
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Please check your email and password.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-8">
      {/* Green decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-48 w-48 rounded-full bg-primary/15 blur-2xl" />

      <Card className="relative z-10 w-full max-w-sm border-0 shadow-2xl">
        <form onSubmit={handleLogin}>
          <CardHeader className="pb-4 text-center">
            <div className="mb-4 flex justify-center">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back!</CardTitle>
            <CardDescription>
              Sign in to manage your ministry.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@church.org"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button
              type="submit"
              className="h-12 w-full text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
