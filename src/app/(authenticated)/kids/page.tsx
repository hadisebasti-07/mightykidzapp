'use client';

import { getKids } from '@/lib/data';
import { KidCard } from '@/components/kids/kid-card';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, SlidersHorizontal, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Kid } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';


export default function KidsPage() {
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);

  console.log(`KidsPage: Component rendered. Loading: ${loading}, Kids count: ${kids.length}`);

  useEffect(() => {
    console.log('KidsPage: useEffect triggered.');
    const fetchKids = async () => {
      console.log('KidsPage: Fetching kids...');
      try {
        const kidsData = await getKids();
        setKids(kidsData);
        console.log(`KidsPage: Fetched kids successfully. Total kids: ${kidsData.length}`);
      } catch (error) {
        console.error("KidsPage: Failed to fetch kids:", error);
      } finally {
        setLoading(false);
        console.log('KidsPage: Loading finished.');
      }
    };

    fetchKids();
  }, []);

  const KidCardSkeleton = () => (
    <Card className="overflow-hidden">
        <Skeleton className="aspect-square w-full" />
        <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-6 w-1/4" />
        </CardFooter>
    </Card>
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Kid Profiles"
        description="Manage profiles for all children in the ministry."
      >
        <Button asChild>
          <Link href="/kids/new">
            <PlusCircle />
            Add Kid
          </Link>
        </Button>
      </PageHeader>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search by name..." className="pl-10 text-base py-6" />
        </div>
        <Button variant="outline" size="lg" className="h-14">
          <SlidersHorizontal />
          Filters
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
            Array.from({ length: 8 }).map((_, i) => <KidCardSkeleton key={i} />)
        ) : kids.length > 0 ? (
          kids.map((kid) => (
            <KidCard key={kid.id} kid={kid} />
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-10">
            <p>No kids found.</p>
            <p>You may need to set up your admin permissions in Firestore.</p>
          </div>
        )}
      </div>
    </div>
  );
}
