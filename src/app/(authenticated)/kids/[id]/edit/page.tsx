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
import { getKidById } from '@/lib/data';
import { Kid } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { withAdminAuth } from '@/components/auth/with-admin-auth';

function EditKidPage() {
  const params = useParams();
  const id = params.id as string;

  const [kid, setKid] = useState<Kid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchKid = async () => {
      try {
        const kidData = await getKidById(id);
        if (kidData) {
          setKid(kidData);
        } else {
          setError(`Kid with id ${id} not found.`);
          console.error(`Kid with id ${id} not found.`);
        }
      } catch (fetchError) {
        console.error("Failed to fetch kid:", fetchError);
        setError("Failed to load kid's profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchKid();
  }, [id]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Edit Kid Profile"
        description="Update the information for an existing child."
      />
      <div className="mx-auto w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Child's Information</CardTitle>
            <CardDescription>
              Make changes to the form below and save.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                    <Skeleton className="h-32 w-32 rounded-full" />
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : error ? (
              <p className="text-destructive text-center">{error}</p>
            ) : kid ? (
              <KidForm kidToEdit={kid} />
            ) : (
                <p className="text-center">Kid not found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAdminAuth(EditKidPage);
