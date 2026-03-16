'use client';

import { useState, useEffect } from 'react';
import { getGifts, getKids, redeemGift } from '@/lib/data';
import { GiftCard } from '@/components/store/gift-card';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { Gift, Kid } from '@/lib/types';
import { RedeemSuccessDialog } from '@/components/store/redeem-success-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { generateGiftRedemptionMessage } from '@/ai/flows/generate-gift-redemption-message';
import { useToast } from '@/hooks/use-toast';

export default function StorePage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isRedeemOpen, setRedeemOpen] = useState(false);
  
  const [redemptionState, setRedemptionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [successMessage, setSuccessMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialData = async () => {
        const kidsData = await getKids();
        setKids(kidsData);
        const giftsData = await getGifts();
        setGifts(giftsData);
    };
    fetchInitialData();
  }, []);

  const handleRedemptionProcess = async (kid: Kid, gift: Gift) => {
    if (!kid || !gift) return;

    setRedemptionState('loading');
    setSuccessMessage('');

    try {
      // 1. Perform DB transaction
      await redeemGift(kid.id, gift.id);

      // 2. After successful DB transaction, generate fun message
      const result = await generateGiftRedemptionMessage({
        kidName: kid.firstName,
        giftName: gift.name,
      });
      setSuccessMessage(result.message);
      setRedemptionState('success');

      // 3. Refresh data in the background
      const kidsData = await getKids();
      setKids(kidsData);
      const giftsData = await getGifts();
      setGifts(giftsData);
      
      // Update selectedKid with new balance
      const updatedSelectedKid = kidsData.find(k => k.id === kid.id);
      setSelectedKid(updatedSelectedKid || null);

    } catch (error: any) {
      console.error('Error during redemption:', error);
      toast({
        variant: 'destructive',
        title: 'Redemption Failed',
        description: error.message || 'There was an issue processing the redemption.',
      });
      setRedemptionState('error');
      setRedeemOpen(false); // Close dialog on error
    }
  };

  const handleRedeemClick = (gift: Gift) => {
    if (selectedKid) {
      setSelectedGift(gift);
      setRedeemOpen(true);
      handleRedemptionProcess(selectedKid, gift);
    } else {
      toast({
        variant: 'destructive',
        title: 'Select a Child',
        description: 'Please select a child before redeeming a gift.',
      });
    }
  };


  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Reward Store"
          description="Redeem coins for awesome gifts."
        >
          <Button asChild>
            <Link href="/store/manage">
              <Settings />
              Manage Gifts
            </Link>
          </Button>
        </PageHeader>
        <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <h3 className="font-semibold">Select Child to Redeem For:</h3>
            <p className="text-sm text-muted-foreground">This tells the system whose coins to use.</p>
          </div>
          <Select onValueChange={(kidId) => setSelectedKid(kids.find(k => k.id === kidId) || null)}>
            <SelectTrigger className="w-full sm:w-[250px] h-14 text-base">
              <SelectValue placeholder="Select a child..." />
            </SelectTrigger>
            <SelectContent>
              {kids.map((kid) => (
                <SelectItem key={kid.id} value={kid.id} className="py-2">
                  <div className="flex items-center gap-2">
                    <img src={kid.photoUrl} className="h-6 w-6 rounded-full" />
                    <span>{kid.firstName} {kid.lastName}</span>
                    <span className="ml-auto text-muted-foreground">{kid.coinsBalance} coins</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {gifts
            .filter((gift) => gift.active)
            .map((gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                onRedeem={() => handleRedeemClick(gift)}
                canRedeem={!!selectedKid && selectedKid.coinsBalance >= gift.coinCost && gift.stock > 0}
              />
            ))}
        </div>
      </div>
      {selectedGift && (
         <RedeemSuccessDialog
            gift={selectedGift}
            open={isRedeemOpen}
            onOpenChange={setRedeemOpen}
            redemptionState={redemptionState}
            successMessage={successMessage}
        />
      )}
    </>
  );
}
