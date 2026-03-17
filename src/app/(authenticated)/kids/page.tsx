'use client';

import { getKids, deleteKid } from '@/lib/data';
import { KidCard } from '@/components/kids/kid-card';
import { PageHeader } from '@/components/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { PlusCircle, SlidersHorizontal, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import type { Kid } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';

export default function KidsPage() {
  const [allKids, setAllKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [kidToDelete, setKidToDelete] = useState<Kid | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');

  useEffect(() => {
    const fetchKids = async () => {
      setLoading(true);
      try {
        const kidsData = await getKids();
        setAllKids(kidsData);
      } catch (error) {
        console.error('KidsPage: Failed to fetch kids:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKids();
  }, []);

  const filteredKids = useMemo(() => {
    if (!filter) {
      return allKids;
    }
    if (filter === 'this_month_birthdays') {
      const currentMonth = new Date().getMonth() + 1;
      return allKids.filter((kid) => kid.birthdayMonth === currentMonth);
    }
    return allKids;
  }, [allKids, filter]);

  const filterTitle = useMemo(() => {
    if (filter === 'this_month_birthdays') {
      return "This Month's Birthdays";
    }
    return null;
  }, [filter]);

  const handleDeleteRequest = (kid: Kid) => {
    setKidToDelete(kid);
  };

  const handleDeleteKid = async () => {
    if (!kidToDelete) return;

    try {
      await deleteKid(kidToDelete.id);
      setAllKids((currentKids) =>
        currentKids.filter((k) => k.id !== kidToDelete.id)
      );
      toast({
        title: 'Kid Deleted',
        description: `${kidToDelete.firstName} ${kidToDelete.lastName} has been removed.`,
      });
    } catch (error) {
      console.error('Failed to delete kid:', error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not remove the kid profile. Please try again.',
      });
    } finally {
      setKidToDelete(null);
    }
  };

  const KidCardSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4">
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
      </CardFooter>
    </Card>
  );

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title={filterTitle || 'Kid Profiles'}
          description={
            filterTitle
              ? `Showing kids with a birthday this month.`
              : 'Manage profiles for all children in the ministry.'
          }
        >
          {filter ? (
            <Button onClick={() => router.push('/kids')}>
              <X className="mr-2" /> Clear Filter
            </Button>
          ) : (
            <Button asChild>
              <Link href="/kids/new">
                <PlusCircle />
                Add Kid
              </Link>
            </Button>
          )}
        </PageHeader>

        {!filter && (
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                className="py-6 pl-10 text-base"
              />
            </div>
            <Button variant="outline" size="lg" className="h-14">
              <SlidersHorizontal />
              Filters
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <KidCardSkeleton key={i} />)
          ) : filteredKids.length > 0 ? (
            filteredKids.map((kid) => (
              <KidCard
                key={kid.id}
                kid={kid}
                onDelete={() => handleDeleteRequest(kid)}
              />
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              <p>
                No kids found
                {filterTitle && ` with a birthday this month`}.
              </p>
            </div>
          )}
        </div>
      </div>
      <AlertDialog
        open={!!kidToDelete}
        onOpenChange={() => setKidToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the profile for {kidToDelete?.firstName}{' '}
              {kidToDelete?.lastName}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteKid}
              className={buttonVariants({ variant: 'destructive' })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
