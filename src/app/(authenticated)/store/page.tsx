'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getGifts, getKids, redeemGift } from '@/lib/data';
import { GiftCard } from '@/components/store/gift-card';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Settings, Search, X, Coins, ScanLine } from 'lucide-react';
import { Gift, Kid } from '@/lib/types';
import { RedeemSuccessDialog } from '@/components/store/redeem-success-dialog';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function StorePage() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [allKids, setAllKids] = useState<Kid[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Kid[]>([]);
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isRedeemOpen, setRedeemOpen] = useState(false);
  const [redemptionState, setRedemptionState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const allKidsRef = useRef(allKids);
  useEffect(() => { allKidsRef.current = allKids; }, [allKids]);

  const BARCODE_PATTERN = useMemo(() => /^MKC-\d{3}-\d{6}$/, []);

  // Auto-focus search when no kid is selected
  useEffect(() => {
    if (!selectedKid) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [selectedKid]);

  // Global keydown → search input (catches barcode scanner input anywhere)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selectedKid) return;
      const tag = (e.target as HTMLElement).tagName;
      const interactive = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable;
      if (!interactive) searchInputRef.current?.focus();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [selectedKid]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const [kidsData, giftsData] = await Promise.all([getKids(), getGifts()]);
      setAllKids(kidsData);
      allKidsRef.current = kidsData;
      setGifts(giftsData);
    };
    fetchInitialData();
  }, []);

  const selectKid = useCallback((kid: Kid) => {
    setSelectedKid(kid);
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  const processScan = useCallback((value: string) => {
    const kid = allKidsRef.current.find(k => k.barcode === value)
             ?? allKidsRef.current.find(k => k.id === value);
    if (kid) {
      selectKid(kid);
    } else {
      toast({ variant: 'destructive', title: 'Kid Not Found', description: `No kid found for barcode: ${value}` });
    }
  }, [selectKid, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (BARCODE_PATTERN.test(value)) {
      setSearchTerm('');
      processScan(value);
      return;
    }
    if (value.trim()) {
      const term = value.toLowerCase();
      setSearchResults(allKids.filter(k =>
        k.firstName.toLowerCase().includes(term) ||
        k.lastName.toLowerCase().includes(term) ||
        k.parentName.toLowerCase().includes(term) ||
        k.parentPhone.includes(value)
      ));
    } else {
      setSearchResults([]);
    }
  };

  const handleRedemptionProcess = async (kid: Kid, gift: Gift) => {
    setRedemptionState('loading');
    try {
      await redeemGift(kid.id, gift.id);
      setRedemptionState('success');
      const [kidsData, giftsData] = await Promise.all([getKids(), getGifts()]);
      setAllKids(kidsData);
      allKidsRef.current = kidsData;
      setGifts(giftsData);
      const updated = kidsData.find(k => k.id === kid.id);
      if (updated) setSelectedKid(updated);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Redemption Failed',
        description: error.message || 'There was an issue processing the redemption.',
      });
      setRedemptionState('error');
      setRedeemOpen(false);
    }
  };

  const handleRedeemClick = (gift: Gift) => {
    if (!selectedKid) {
      toast({ variant: 'destructive', title: 'No Child Selected', description: 'Scan or search for a child first.' });
      return;
    }
    setSelectedGift(gift);
    setRedeemOpen(true);
    handleRedemptionProcess(selectedKid, gift);
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader title="Reward Store" description="Redeem coins for awesome gifts.">
          <Button asChild>
            <Link href="/store/manage">
              <Settings />
              Manage Gifts
            </Link>
          </Button>
        </PageHeader>

        {/* ── Step 1: Find child ── */}
        {!selectedKid ? (
          <div className="mx-auto w-full max-w-2xl space-y-4">
            <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</div>
                <div>
                  <h3 className="font-semibold">Find the Child</h3>
                  <p className="text-sm text-muted-foreground">Scan their card or search by name.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scanner ready</span>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by name or scan card…"
                  value={searchTerm}
                  onChange={handleInputChange}
                  className="h-14 rounded-2xl bg-background pl-12 text-base shadow-sm"
                  autoComplete="off"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => { setSearchTerm(''); setSearchResults([]); }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {searchResults.map((kid) => (
                    <button
                      key={kid.id}
                      onClick={() => selectKid(kid)}
                      className="flex w-full items-center gap-3 rounded-xl border bg-background p-3 text-left transition-colors hover:bg-accent"
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={kid.photoUrl} alt={kid.firstName} />
                        <AvatarFallback className="text-sm font-bold">
                          {kid.firstName[0]}{kid.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{kid.firstName} {kid.lastName}</p>
                        {kid.className && (
                          <p className="text-xs text-muted-foreground capitalize">{kid.className}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 text-sm font-semibold text-primary">
                        <Coins className="h-4 w-4" />
                        {kid.coinsBalance}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchTerm && searchResults.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-2">No children found.</p>
              )}
            </div>
          </div>
        ) : (
          /* ── Selected kid card ── */
          <div className="mx-auto w-full max-w-2xl">
            <div className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm">
              <Avatar className="h-16 w-16 shrink-0 ring-2 ring-primary ring-offset-2 ring-offset-card">
                <AvatarImage src={selectedKid.photoUrl} alt={selectedKid.firstName} />
                <AvatarFallback className="text-xl font-bold">
                  {selectedKid.firstName[0]}{selectedKid.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold truncate">{selectedKid.firstName} {selectedKid.lastName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {selectedKid.className && (
                    <Badge variant="secondary" className="capitalize text-xs">{selectedKid.className}</Badge>
                  )}
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <Coins className="h-4 w-4" />
                    <span>{selectedKid.coinsBalance} coins</span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => setSelectedKid(null)}
              >
                <ScanLine className="mr-1.5 h-4 w-4" />
                Change
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Gifts grid ── */}
        <div className={`transition-opacity ${!selectedKid ? 'opacity-40 pointer-events-none' : ''}`}>
          {!selectedKid && (
            <div className="flex items-center gap-3 mb-4 mx-auto max-w-2xl">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold">2</div>
              <h3 className="font-semibold text-muted-foreground">Select a Gift</h3>
            </div>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>

      {selectedGift && (
        <RedeemSuccessDialog
          gift={selectedGift}
          open={isRedeemOpen}
          onOpenChange={setRedeemOpen}
          redemptionState={redemptionState}
        />
      )}
    </>
  );
}
