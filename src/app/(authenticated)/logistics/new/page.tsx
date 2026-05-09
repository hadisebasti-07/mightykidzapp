'use client';

import { PageHeader } from '@/components/page-header';
import { LogisticsForm } from '@/components/logistics/logistics-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { withAdminAuth } from '@/components/auth/with-admin-auth';

function NewLogisticsItemPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Add Logistics Item"
        description="Add a new prop, costume, or resource to the inventory."
      />
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>
              Fill out the form below to add the item to your logistics inventory.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LogisticsForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAdminAuth(NewLogisticsItemPage);
