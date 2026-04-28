'use client';

import { getKidsPaginated, getKids, deleteKid, type KidSortField, type KidCursor } from '@/lib/data';
import { KidCard } from '@/components/kids/kid-card';
import { PageHeader } from '@/components/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  PlusCircle,
  SlidersHorizontal,
  Search,
  X,
  Download,
  Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { useEffect, useState, useMemo, useCallback } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';
import { ImportKidsDialog } from '@/components/kids/import-dialog';
import { UpdateKidsDialog } from '@/components/kids/update-dialog';
import { withAdminAuth } from '@/components/auth/with-admin-auth';

type ActiveFilters = {
  genders: string[];
  classes: string[];
  houseColors: string[];
};

const EMPTY_FILTERS: ActiveFilters = { genders: [], classes: [], houseColors: [] };

type SortKey = 'newest' | 'oldest' | 'name_az' | 'name_za' | 'coins_desc';

const SORT_OPTIONS: Record<SortKey, { field: KidSortField; dir: 'asc' | 'desc'; label: string }> = {
  newest:     { field: 'createdAt',    dir: 'desc', label: 'Newest first' },
  oldest:     { field: 'createdAt',    dir: 'asc',  label: 'Oldest first' },
  name_az:    { field: 'firstName',    dir: 'asc',  label: 'Name A–Z' },
  name_za:    { field: 'firstName',    dir: 'desc', label: 'Name Z–A' },
  coins_desc: { field: 'coinsBalance', dir: 'desc', label: 'Most coins' },
};

function KidsPage() {
  const [allKids, setAllKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<KidCursor | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [kidToDelete, setKidToDelete] = useState<Kid | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchPool, setSearchPool] = useState<Kid[] | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(EMPTY_FILTERS);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');

  const { field, dir } = SORT_OPTIONS[sortKey];

  const loadFirst = useCallback(async (f: KidSortField, d: 'asc' | 'desc') => {
    setLoading(true);
    setAllKids([]);
    setCursor(null);
    try {
      const result = await getKidsPaginated(f, d);
      setAllKids(result.kids);
      setCursor(result.cursor);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('KidsPage: Failed to fetch kids:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFirst(field, dir);
  }, [loadFirst, field, dir]);

  useEffect(() => {
    if (!searchTerm) {
      setSearchPool(null);
      return;
    }
    if (searchPool !== null) return; // already loaded
    setIsSearchLoading(true);
    getKids().then(setSearchPool).catch(console.error).finally(() => setIsSearchLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!searchTerm]);

  const handleLoadMore = async () => {
    if (!cursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const result = await getKidsPaginated(field, dir, cursor);
      setAllKids((prev) => [...prev, ...result.kids]);
      setCursor(result.cursor);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('KidsPage: Failed to load more:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const filterOptions = useMemo(() => {
    const classes = [...new Set(allKids.map((k) => k.className).filter(Boolean) as string[])].sort();
    const houseColors = [...new Set(allKids.map((k) => k.houseColor).filter(Boolean) as string[])].sort();
    return { classes, houseColors };
  }, [allKids]);

  const activeFilterCount = useMemo(
    () => activeFilters.genders.length + activeFilters.classes.length + activeFilters.houseColors.length,
    [activeFilters]
  );

  const filteredKids = useMemo(() => {
    let kids = searchTerm ? (searchPool ?? allKids) : allKids;
    if (filter === 'this_month_birthdays') {
      const currentMonth = new Date().getMonth() + 1;
      kids = kids.filter((k) => k.birthdayMonth === currentMonth);
    }
    if (activeFilters.genders.length > 0)
      kids = kids.filter((k) => activeFilters.genders.includes(k.gender));
    if (activeFilters.classes.length > 0)
      kids = kids.filter((k) => k.className && activeFilters.classes.includes(k.className));
    if (activeFilters.houseColors.length > 0)
      kids = kids.filter((k) => k.houseColor && activeFilters.houseColors.includes(k.houseColor));
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      kids = kids.filter(
        (k) =>
          k.firstName.toLowerCase().includes(term) ||
          k.lastName.toLowerCase().includes(term) ||
          k.parentName.toLowerCase().includes(term)
      );
    }
    return kids;
  }, [allKids, searchPool, filter, searchTerm, activeFilters]);

  const filterTitle = useMemo(() => {
    if (filter === 'this_month_birthdays') return "This Month's Birthdays";
    return null;
  }, [filter]);

  const toggleFilter = (key: keyof ActiveFilters, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  };

  const handleDeleteRequest = (kid: Kid) => setTimeout(() => setKidToDelete(kid), 0);

  const handleDeleteKid = async () => {
    if (!kidToDelete) return;
    try {
      await deleteKid(kidToDelete.id);
      setAllKids((prev) => prev.filter((k) => k.id !== kidToDelete.id));
      toast({ title: 'Kid Deleted', description: `${kidToDelete.firstName} ${kidToDelete.lastName} has been removed.` });
    } catch {
      toast({ variant: 'destructive', title: 'Deletion Failed', description: 'Could not remove the kid profile. Please try again.' });
    } finally {
      setKidToDelete(null);
    }
  };

  const handleExport = async () => {
    toast({ title: 'Exporting...', description: 'Fetching all kids for download.' });
    try {
      const allKidsForExport = await getKids();
      if (allKidsForExport.length === 0) {
        toast({ variant: 'destructive', title: 'No Data to Export', description: 'There are no kid profiles to export.' });
        return;
      }
      const headers = [
        'id', 'firstName', 'lastName', 'nickname', 'dateOfBirth', 'gender',
        'email', 'className', 'houseColor', 'status',
        'parentName', 'parentPhone', 'parent2Name', 'parent2Phone',
        'allergies', 'medicalNotes', 'coinsBalance', 'totalAttendance', 'createdAt',
      ];
      const escape = (v: any) => {
        if (v === undefined || v === null) return '';
        const s = String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const csv = [headers.join(','), ...allKidsForExport.map((k) => headers.map((h) => escape((k as any)[h])).join(','))].join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const a = Object.assign(document.createElement('a'), { href: url, download: `mightykidz-kids-export-${new Date().toISOString().split('T')[0]}.csv` });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Export Complete', description: `${allKidsForExport.length} kid profiles downloaded.` });
    } catch {
      toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not export the kid data. Please try again.' });
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
          description={filterTitle ? `Showing kids with a birthday this month.` : 'Manage profiles for all children in the ministry.'}
        >
          {filter ? (
            <Button onClick={() => router.push('/kids')}>
              <X className="mr-2" /> Clear Filter
            </Button>
          ) : (
            <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
              <Button variant="outline" onClick={handleExport}>
                <Download />
                Export All
              </Button>
              <ImportKidsDialog />
              <UpdateKidsDialog />
              <Button asChild>
                <Link href="/kids/new">
                  <PlusCircle />
                  Add Kid
                </Link>
              </Button>
            </div>
          )}
        </PageHeader>

        {!filter && (
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by kid or parent name..."
                className="py-6 pl-10 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="h-14 w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(SORT_OPTIONS) as [SortKey, typeof SORT_OPTIONS[SortKey]][]).map(([key, opt]) => (
                  <SelectItem key={key} value={key}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="lg" className="relative h-14 w-full sm:w-auto">
                  <SlidersHorizontal />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4" align="end">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold">Filters</span>
                  {activeFilterCount > 0 && (
                    <button onClick={() => setActiveFilters(EMPTY_FILTERS)} className="text-xs text-muted-foreground hover:text-foreground">
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Gender</p>
                  {(['Male', 'Female'] as const).map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer py-1">
                      <Checkbox checked={activeFilters.genders.includes(g)} onCheckedChange={() => toggleFilter('genders', g)} />
                      <span className="text-sm">{g}</span>
                    </label>
                  ))}
                </div>

                {filterOptions.classes.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Class</p>
                      {filterOptions.classes.map((cls) => (
                        <label key={cls} className="flex items-center gap-2 cursor-pointer py-1">
                          <Checkbox checked={activeFilters.classes.includes(cls)} onCheckedChange={() => toggleFilter('classes', cls)} />
                          <span className="text-sm">{cls}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}

                {filterOptions.houseColors.length > 0 && (
                  <>
                    <Separator className="my-3" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">House</p>
                      {filterOptions.houseColors.map((color) => (
                        <label key={color} className="flex items-center gap-2 cursor-pointer py-1">
                          <Checkbox checked={activeFilters.houseColors.includes(color)} onCheckedChange={() => toggleFilter('houseColors', color)} />
                          <span className="text-sm capitalize">{color}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </PopoverContent>
            </Popover>
          </div>
        )}

        {activeFilterCount > 0 && !filter && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.genders.map((g) => (
              <Badge key={g} variant="secondary" className="gap-1">
                {g}
                <button onClick={() => toggleFilter('genders', g)} className="ml-1 hover:text-foreground"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
            {activeFilters.classes.map((cls) => (
              <Badge key={cls} variant="secondary" className="gap-1">
                {cls}
                <button onClick={() => toggleFilter('classes', cls)} className="ml-1 hover:text-foreground"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
            {activeFilters.houseColors.map((color) => (
              <Badge key={color} variant="secondary" className="gap-1 capitalize">
                {color}
                <button onClick={() => toggleFilter('houseColors', color)} className="ml-1 hover:text-foreground"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {loading || isSearchLoading ? (
            Array.from({ length: 8 }).map((_, i) => <KidCardSkeleton key={i} />)
          ) : filteredKids.length > 0 ? (
            filteredKids.map((kid) => (
              <KidCard key={kid.id} kid={kid} onDelete={() => handleDeleteRequest(kid)} showBirthday={filter === 'this_month_birthdays'} />
            ))
          ) : (
            <div className="col-span-full py-10 text-center text-muted-foreground">
              <p>
                No kids found
                {filterTitle && ` with a birthday this month`}
                {searchTerm && ` for "${searchTerm}"`}
                {activeFilterCount > 0 && ` matching the selected filters`}.
              </p>
            </div>
          )}
        </div>

        {hasMore && !loading && !searchTerm && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleLoadMore} disabled={isLoadingMore}>
              {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoadingMore ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={!!kidToDelete} onOpenChange={() => setKidToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the profile for{' '}
              <strong>{kidToDelete?.firstName} {kidToDelete?.lastName}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKid} className={buttonVariants({ variant: 'destructive' })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default withAdminAuth(KidsPage);
