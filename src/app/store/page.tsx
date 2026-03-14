'use client';

import { useState } from 'react';
import { getGifts, getKids } from '@/lib/data';
import { GiftCard } from '@/components/store/gift-card';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, SlidersHorizontal, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Gift, Kid } from '@/lib/types';
import { RedeemSuccessDialog } from '@/components/store/redeem-success-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function StorePage() {
  const gifts = getGifts();
  const kids = getKids();
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isRedeemOpen, setRedeemOpen] = useState(false);

  const handleRedeem = (gift: Gift) => {
    if (selectedKid) {
      setSelectedGift(gift);
      setRedeemOpen(true);
    } else {
      // In a real app, you'd show a toast or message to select a kid first.
      alert('Please select a child first!');
    }
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Reward Store"
          description="Redeem coins for awesome gifts."
        >
          <Button>
            <PlusCircle />
            Add Gift
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
                onRedeem={() => handleRedeem(gift)}
                canRedeem={!!selectedKid && selectedKid.coinsBalance >= gift.coinCost}
              />
            ))}
        </div>
      </div>
      {selectedKid && selectedGift && (
         <RedeemSuccessDialog
            kid={selectedKid}
            gift={selectedGift}
            open={isRedeemOpen}
            onOpenChange={setRedeemOpen}
        />
      )}
    </>
  );
}
