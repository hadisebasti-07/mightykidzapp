'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, MoreHorizontal, Package, AlertTriangle, ExternalLink } from 'lucide-react';

import { getLogisticsItems, deleteLogisticsItem } from '@/lib/data';
import type { LogisticsItem } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { withAdminAuth } from '@/components/auth/with-admin-auth';

const CATEGORY_LABELS: Record<LogisticsItem['category'], string> = {
  costume: 'Costume',
  'game-equipment': 'Game Equipment',
  'skit-prop': 'Skit / Drama Prop',
  'craft-supply': 'Craft & Art Supply',
  decoration: 'Decoration & Backdrop',
  'av-tech': 'AV & Tech',
  'teaching-material': 'Teaching Material',
  consumable: 'Consumable',
  other: 'Other',
};

const CONDITION_VARIANT: Record<
  LogisticsItem['condition'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  good: 'default',
  fair: 'secondary',
  poor: 'destructive',
  'needs-repair': 'outline',
};

const CONDITION_LABELS: Record<LogisticsItem['condition'], string> = {
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
  'needs-repair': 'Needs Repair',
};

function isExpiringSoon(dateStr?: string): boolean {
  if (!dateStr) return false;
  const expiry = new Date(dateStr);
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);
  return expiry <= soon;
}

function isExpired(dateStr?: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function LogisticsPage() {
  const [items, setItems] = useState<LogisticsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<LogisticsItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    const data = await getLogisticsItems();
    setItems(data);
    setLoading(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    // Optimistically remove — dialog closes via AlertDialogAction's own Radix mechanism
    setItems((prev) => prev.filter((i) => i.id !== target.id));
    deleteLogisticsItem(target.id).then(() => {
      toast({ title: 'Item Deleted', description: `${target.name} has been removed.` });
    }).catch(() => {
      setItems((prev) => [...prev, target].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      toast({ variant: 'destructive', title: 'Delete Failed', description: 'Could not delete the item.' });
    });
  }

  const filtered =
    categoryFilter === 'all' ? items : items.filter((i) => i.category === categoryFilter);

  const RowSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-10 w-10 rounded-md" /></TableCell>
      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-8" /></TableCell>
      <TableCell className="hidden lg:table-cell"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
      <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
    </TableRow>
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Logistics"
        description="Manage props, costumes, and other ministry resources."
      >
        <Button asChild>
          <Link href="/logistics/new">
            <PlusCircle />
            Add Item
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>All props and resources in the system.</CardDescription>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {(Object.entries(CATEGORY_LABELS) as [LogisticsItem['category'], string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden md:table-cell">Qty</TableHead>
                <TableHead className="hidden lg:table-cell">Condition</TableHead>
                <TableHead className="hidden lg:table-cell">Location</TableHead>
                <TableHead className="hidden xl:table-cell">Assigned To</TableHead>
                <TableHead className="hidden xl:table-cell">Last Used For</TableHead>
                <TableHead className="hidden xl:table-cell">Expiry</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="py-12 text-center text-muted-foreground">
                    <Package className="mx-auto mb-2 size-8 opacity-40" />
                    No items found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10 rounded-md">
                        <AvatarImage src={item.photoUrl} alt={item.name} className="object-cover" />
                        <AvatarFallback className="rounded-md bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground/50" />
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.reorderLink && (
                            <a
                              href={item.reorderLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-primary"
                              title="Reorder Link"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {item.description}
                          </p>
                        )}
                        {item.supplier && (
                          <p className="text-xs text-muted-foreground">{item.supplier}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{CATEGORY_LABELS[item.category]}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{item.quantity}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant={CONDITION_VARIANT[item.condition]}>
                        {CONDITION_LABELS[item.condition]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {item.location || '—'}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground">
                      {item.assignedTo || '—'}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-muted-foreground">
                      {item.lastUsedFor || '—'}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {item.expiryDate ? (
                        <span className={`flex items-center gap-1 text-sm ${isExpired(item.expiryDate) ? 'text-destructive font-medium' : isExpiringSoon(item.expiryDate) ? 'text-amber-500 font-medium' : 'text-muted-foreground'}`}>
                          {(isExpired(item.expiryDate) || isExpiringSoon(item.expiryDate)) && (
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          )}
                          {item.expiryDate}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/logistics/${item.id}/edit`}>Edit</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={() => setTimeout(() => setDeleteTarget(item), 0)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default withAdminAuth(LogisticsPage);
