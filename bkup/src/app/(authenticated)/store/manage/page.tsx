'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getGifts, deleteGift } from '@/lib/data';
import type { Gift } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ManageGiftsPage() {
    const [gifts, setGifts] = useState<Gift[]>([]);
    const [loading, setLoading] = useState(true);
    const [giftToDelete, setGiftToDelete] = useState<Gift | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchGifts = async () => {
            try {
                const giftsData = await getGifts();
                setGifts(giftsData);
            } catch (error) {
                console.error("Failed to fetch gifts:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load gifts.' });
            } finally {
                setLoading(false);
            }
        };
        fetchGifts();
    }, [toast]);

    const handleDeleteRequest = (gift: Gift) => {
        setGiftToDelete(gift);
    };

    const handleDelete = async () => {
        if (!giftToDelete) return;
        try {
            await deleteGift(giftToDelete.id);
            setGifts(currentGifts => currentGifts.filter(g => g.id !== giftToDelete.id));
            toast({ title: 'Gift Deleted', description: `${giftToDelete.name} has been removed.` });
        } catch (error) {
            console.error('Failed to delete gift:', error);
            toast({ variant: 'destructive', title: 'Deletion Failed', description: 'Could not remove the gift. Please try again.' });
        } finally {
            setGiftToDelete(null);
        }
    };
    
    const GiftRowSkeleton = () => (
      <TableRow>
        <TableCell><Skeleton className="size-10 rounded-md" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
      </TableRow>
    );

    return (
        <>
            <div className="flex flex-col gap-8">
                <PageHeader
                    title="Manage Gifts"
                    description="Add, edit, or delete gifts from the reward store."
                >
                    <Button asChild>
                        <Link href="/store/gift/new">
                            <PlusCircle />
                            Add Gift
                        </Link>
                    </Button>
                </PageHeader>
                <Card>
                    <CardHeader>
                        <CardTitle>Gift Catalog</CardTitle>
                        <CardDescription>A list of all gifts available in the store.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => <GiftRowSkeleton key={i} />)
                                ) : gifts.map((gift) => (
                                    <TableRow key={gift.id}>
                                        <TableCell className="hidden sm:table-cell">
                                            <Image
                                                alt={gift.name}
                                                className="aspect-square rounded-md object-cover"
                                                height="64"
                                                src={gift.imageUrl}
                                                width="64"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{gift.name}</TableCell>
                                        <TableCell>{gift.coinCost}</TableCell>
                                        <TableCell>{gift.stock}</TableCell>
                                        <TableCell>
                                            <Badge variant={gift.active ? 'default' : 'secondary'}>
                                                {gift.active ? 'Active' : 'Inactive'}
                                            </Badge>
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
                                                    <DropdownMenuItem asChild><Link href={`/store/gift/${gift.id}/edit`}>Edit</Link></DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteRequest(gift)}>Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <AlertDialog open={!!giftToDelete} onOpenChange={() => setGiftToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the gift: {giftToDelete?.name}. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className={buttonVariants({ variant: "destructive" })}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
