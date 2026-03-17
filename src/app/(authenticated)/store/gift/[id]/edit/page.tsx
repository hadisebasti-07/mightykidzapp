'use client';

import { PageHeader } from '@/components/page-header';
import { GiftForm } from '@/components/store/gift-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getGiftById } from '@/lib/data';
import { Gift } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditGiftPage({ params }: { params: { id: string } }) {
  const [gift, setGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = params;

  useEffect(() => {
    if (!id) return;
    const fetchGift = async () => {
      try {
        const giftData = await getGiftById(id);
        if (giftData) {
          setGift(giftData);
        } else {
          setError(`Gift with id ${id} not found.`);
        }
      } catch (fetchError) {
        console.error("Failed to fetch gift:", fetchError);
        setError("Failed to load gift. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchGift();
  }, [id]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Edit Gift"
        description="Update the details for an existing gift."
      />
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Gift Details</CardTitle>
            <CardDescription>
              Make changes to the form below and save.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                    <Skeleton className="h-32 w-32 rounded-md" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : error ? (
              <p className="text-destructive text-center">{error}</p>
            ) : gift ? (
              <GiftForm giftToEdit={gift} />
            ) : (
                <p className="text-center">Gift not found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
