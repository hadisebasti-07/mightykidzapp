
import { PageHeader } from '@/components/page-header';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RegistrationSuccessPage() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen py-12 text-center">
        <CheckCircle2 className="size-24 text-green-500 mb-6" />
        <PageHeader
            title="Registration Submitted!"
            description="Thank you! Your child's registration has been sent for approval. You may now close this page."
        />
        <Button asChild className="mt-8">
          <Link href="/login">Return to Login</Link>
        </Button>
    </div>
  );
}
