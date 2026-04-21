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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getKidById, awardCoins } from '@/lib/data';
import { Kid } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from 'next/navigation';
import { withAdminAuth } from '@/components/auth/with-admin-auth';
import { useToast } from '@/hooks/use-toast';
import { Coins, Plus } from 'lucide-react';

const QUICK_AMOUNTS = [10, 20, 50];

function EditKidPage() {
  const params = useParams();
  const id = params.id as string;

  const [kid, setKid] = useState<Kid | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [coinsBalance, setCoinsBalance] = useState(0);
  const [customAmount, setCustomAmount] = useState('');
  const [reason, setReason] = useState('');
  const [awarding, setAwarding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    const fetchKid = async () => {
      try {
        const kidData = await getKidById(id);
        if (kidData) {
          setKid(kidData);
          setCoinsBalance(kidData.coinsBalance);
        } else {
          setError(`Kid with id ${id} not found.`);
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

  const handleAward = async (amount: number) => {
    if (!kid || awarding) return;
    const trimmedReason = reason.trim() || 'Manual award';
    setAwarding(true);
    try {
      await awardCoins(kid.id, amount, trimmedReason);
      setCoinsBalance((prev) => prev + amount);
      setCustomAmount('');
      setReason('');
      toast({ title: `+${amount} coins awarded`, description: `${kid.firstName} now has ${coinsBalance + amount} coins.` });
    } catch {
      toast({ variant: 'destructive', title: 'Failed to award coins', description: 'Please try again.' });
    } finally {
      setAwarding(false);
    }
  };

  const handleCustomAward = () => {
    const parsed = parseInt(customAmount, 10);
    if (!parsed || parsed <= 0) {
      toast({ variant: 'destructive', title: 'Invalid amount', description: 'Enter a positive number.' });
      return;
    }
    handleAward(parsed);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Edit Kid Profile"
        description="Update the information for an existing child."
      />
      <div className="mx-auto w-full max-w-2xl flex flex-col gap-6">
        {/* Coin Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Coin Balance
            </CardTitle>
            <CardDescription>Award coins independently from the check-in flow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold text-primary">{coinsBalance}</span>
                  <span className="text-muted-foreground text-sm">coins</span>
                </div>

                <Input
                  placeholder="Reason (optional)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />

                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((amt) => (
                    <Button
                      key={amt}
                      variant="outline"
                      onClick={() => handleAward(amt)}
                      disabled={awarding || !kid}
                    >
                      <Plus className="h-4 w-4" />
                      {amt}
                    </Button>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      placeholder="Custom"
                      className="w-28"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCustomAward()}
                    />
                    <Button onClick={handleCustomAward} disabled={awarding || !kid || !customAmount}>
                      Award
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Child's Information</CardTitle>
            <CardDescription>Make changes to the form below and save.</CardDescription>
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
