'use client';

import { PageHeader } from '@/components/page-header';
import { KidForm } from '@/components/kids/kid-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { withAdminAuth } from '@/components/auth/with-admin-auth';

function NewKidPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Add New Kid"
        description="Create a new profile for a child."
      />
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Child's Information</CardTitle>
            <CardDescription>
              Fill out the form below to add a new child to the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KidForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAdminAuth(NewKidPage);
