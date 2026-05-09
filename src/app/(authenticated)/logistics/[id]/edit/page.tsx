'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { getLogisticsItemById } from '@/lib/data';
import type { LogisticsItem } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { LogisticsForm } from '@/components/logistics/logistics-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { withAdminAuth } from '@/components/auth/with-admin-auth';

function EditLogisticsItemPage() {
  const params = useParams();
  const id = params.id as string;
  const [item, setItem] = useState<LogisticsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItem() {
      const data = await getLogisticsItemById(id);
      setItem(data);
      setLoading(false);
    }
    fetchItem();
  }, [id]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Edit Logistics Item"
        description="Update the details of this logistics item."
      />
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
            <CardDescription>
              {loading ? <Skeleton className="h-4 w-48" /> : item ? item.name : 'Item not found'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : item ? (
              <LogisticsForm item={item} />
            ) : (
              <p className="text-muted-foreground">This item could not be found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAdminAuth(EditLogisticsItemPage);
