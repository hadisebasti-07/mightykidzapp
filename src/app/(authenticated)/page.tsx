'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  UserCheck,
  X,
  QrCode,
  UserPlus,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { getKids, getRecentActivities, checkInKid, getTodayCheckedInKidIds } from '@/lib/data';
import { Kid } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Confetti } from '@/components/confetti';
import { BrowserMultiFormatReader, NotFoundException, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [allKids, setAllKids] = useState<Kid[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Kid[]>([]);
  const [quickCheckInKids, setQuickCheckInKids] = useState<Kid[]>([]);

  const [kidForSuccessOverlay, setKidForSuccessOverlay] = useState<Kid | null>(null);
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [checkedInKidIds, setCheckedInKidIds] = useState<Set<string>>(new Set());
  const [loadingInitial, setLoadingInitial] = useState(true);

  const { toast } = useToast();
  
  const allKidsRef = useRef(allKids);
  useEffect(() => {
    allKidsRef.current = allKids;
  }, [allKids]);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleCheckIn = useCallback(async (kid: Kid, fromScanner = false) => {
    setCheckedInKidIds(prev => new Set(prev).add(kid.id));
    setKidForSuccessOverlay({ ...kid, coinsBalance: kid.coinsBalance + 10 });
    
    if (fromScanner) {
      setScannerOpen(false);
      setTimeout(() => setShowSuccess(true), 300);
    } else {
      setShowSuccess(true);
    }

    try {
      await checkInKid(kid.id);
      const refreshedKids = await getKids();
      setAllKids(refreshedKids);
      setSearchResults(prev => prev.map(k => k.id === kid.id ? refreshedKids.find(rk => rk.id === kid.id) || k : k));
      setQuickCheckInKids(prev => prev.map(k => k.id === kid.id ? refreshedKids.find(rk => rk.id === kid.id) || k : k));
    } catch (e: any) {
      console.error("Check-in failed:", e);
      toast({
        variant: "destructive",
        title: "Check-in Failed",
        description: e.message || "Could not sync with database. Please try again.",
      });
      setShowSuccess(false);
      setKidForSuccessOverlay(null);
      setCheckedInKidIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(kid.id);
        return newSet;
      });
    }
  }, [toast]);
  
  const processScan = useCallback((kidId: string) => {
    const kid = allKidsRef.current.find((k) => k.id === kidId);
    if (kid) {
      if (checkedInKidIds.has(kidId)) {
        toast({
            title: 'Already Checked In',
            description: `${kid.firstName} is already checked in for today.`,
        });
        setScannerOpen(false);
        return;
      }
      handleCheckIn(kid, true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Kid Not Found',
        description: `No kid record found for ID: ${kidId}`,
      });
      setScannerOpen(false);
    }
  }, [handleCheckIn, toast, checkedInKidIds]);

  useEffect(() => {
    let codeReader: BrowserMultiFormatReader | null = null;
    if (isScannerOpen && videoRef.current) {
        const hints = new Map();
        const formats = [BarcodeFormat.CODE_128, BarcodeFormat.CODE_39];
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
        
        codeReader = new BrowserMultiFormatReader(hints);

        codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (result) {
            codeReader?.reset();
            processScan(result.getText());
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error('Barcode scan error:', err);
          }
        }).catch((err) => {
          console.error('Camera start error:', err);
          toast({
              variant: 'destructive',
              title: 'Camera Error',
              description: 'Could not access camera. Please check permissions.',
          });
          setScannerOpen(false);
        });
    }

    return () => {
      codeReader?.reset();
    };
  }, [isScannerOpen, processScan, toast]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingInitial(true);
      const [kidsData, checkedInIds, recentActivitiesData] = await Promise.all([
        getKids(),
        getTodayCheckedInKidIds(),
        getRecentActivities()
      ]);

      setAllKids(kidsData);
      allKidsRef.current = kidsData;
      setCheckedInKidIds(new Set(checkedInIds));

      const recentCheckIns = recentActivitiesData.filter(
        (a) => a.type === 'check-in' && !checkedInIds.includes(a.kidId)
      );

      const recentKidNames = [...new Set(recentCheckIns.map((a) => a.kidName))];
      const quickKids = recentKidNames
        .map((name) =>
          kidsData.find((k) => `${k.firstName} ${k.lastName}` === name)
        )
        .filter((k): k is Kid => !!k)
        .slice(0, 3);
      setQuickCheckInKids(quickKids);
      setLoadingInitial(false);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSuccess) {
      timer = setTimeout(() => {
        setShowSuccess(false);
        setKidForSuccessOverlay(null);
      }, 8000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccess]);

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    const results = allKids.filter(
      (kid) =>
        kid.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kid.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kid.parentPhone.includes(searchTerm)
    );
    setSearchResults(results);
  };
  
  const QuickCheckInSkeleton = () => (
    <div className="flex items-center gap-2 rounded-xl border p-2 shadow-sm sm:gap-4 sm:p-4">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full sm:h-16 sm:w-16" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-4 w-2/5" />
      </div>
      <Skeleton className="h-10 w-24 rounded-md sm:h-12 sm:w-32" />
    </div>
  )

  return (
    <>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Sunday Check-In"
          description="Search for a child or use one of the quick options below."
        >
          <Button asChild className="hidden sm:flex">
            <Link href="/kids/new">
              <UserPlus />
              Register New Kid
            </Link>
          </Button>
        </PageHeader>

        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <div className="relative w-full flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or parent phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-14 w-full rounded-full bg-card pl-12 pr-28 text-base"
              />
              <Button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-full px-6 text-sm"
              >
                Search
              </Button>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Dialog open={isScannerOpen} onOpenChange={setScannerOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-14 w-full flex-col gap-1 rounded-2xl sm:w-20"
                  >
                    <QrCode className="h-6 w-6" />
                    <span className="text-xs">Scan</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Scan Barcode</DialogTitle>
                    <DialogDescription>Point your camera at a barcode to check-in a kid.</DialogDescription>
                  </DialogHeader>
                  <video ref={videoRef} className="w-full rounded-lg border bg-muted" playsInline />
                </DialogContent>
              </Dialog>
              <Button
                asChild
                className="h-14 flex-1 flex-col gap-1 rounded-2xl sm:hidden"
              >
                <Link href="/kids/new">
                  <UserPlus className="h-6 w-6" />
                  <span className="text-xs">Register</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="mx-auto w-full max-w-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Search Results</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchResults([]);
                  setSearchTerm('');
                }}
              >
                <X className="mr-2 h-4 w-4" /> Clear Search
              </Button>
            </div>
            {searchResults.map((kid) => (
               <div
                key={kid.id}
                className="flex items-center gap-2 rounded-xl border bg-card p-2 shadow-sm sm:gap-4 sm:p-4"
              >
                <Avatar className="h-12 w-12 shrink-0 sm:h-16 sm:w-16">
                  <AvatarImage src={kid.photoUrl} alt={kid.firstName} />
                  <AvatarFallback className="sm:text-2xl">
                    {kid.firstName.charAt(0)}
                    {kid.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate font-bold sm:text-xl">
                    {kid.firstName} {kid.lastName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    Parent: {kid.parentName}
                  </p>
                </div>
                <Button
                  className="h-10 flex-shrink-0 px-3 text-sm sm:h-12 sm:px-6 sm:text-base"
                  onClick={() => handleCheckIn(kid)}
                  disabled={checkedInKidIds.has(kid.id)}
                >
                  {checkedInKidIds.has(kid.id) ? (
                    <CheckCircle2 className="mr-1 h-4 w-4 sm:mr-2" />
                  ) : (
                    <UserCheck className="mr-1 h-4 w-4 sm:mr-2" />
                  )}
                  {checkedInKidIds.has(kid.id) ? 'Checked In' : 'Check In'}
                </Button>
              </div>
            ))}
          </div>
        )}

        {searchResults.length === 0 && (
          <div className="mx-auto w-full max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle>Quick Check-In</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingInitial ? (
                    <>
                        <QuickCheckInSkeleton />
                        <QuickCheckInSkeleton />
                        <QuickCheckInSkeleton />
                    </>
                ) : quickCheckInKids.length > 0 ? (
                  quickCheckInKids.map((kid) => (
                    <div
                      key={kid.id}
                      className="flex items-center gap-2 rounded-xl border bg-background p-2 shadow-sm sm:gap-4 sm:p-4"
                    >
                      <Avatar className="h-12 w-12 shrink-0 sm:h-16 sm:w-16">
                        <AvatarImage src={kid.photoUrl} alt={kid.firstName} />
                        <AvatarFallback className="sm:text-2xl">
                          {kid.firstName.charAt(0)}
                          {kid.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-bold sm:text-xl">
                          {kid.firstName} {kid.lastName}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          Parent: {kid.parentName}
                        </p>
                      </div>
                      <Button
                        className="h-10 flex-shrink-0 px-3 text-sm sm:h-12 sm:px-6 sm:text-base"
                        onClick={() => handleCheckIn(kid)}
                        disabled={checkedInKidIds.has(kid.id)}
                      >
                         {checkedInKidIds.has(kid.id) ? (
                            <CheckCircle2 className="mr-1 h-4 w-4 sm:mr-2" />
                          ) : (
                            <UserCheck className="mr-1 h-4 w-4 sm:mr-2" />
                          )}
                          {checkedInKidIds.has(kid.id) ? 'Checked In' : 'Check In'}
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    No recent check-ins found.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {showSuccess && kidForSuccessOverlay && (
        <div className="fixed inset-0 z-50 flex h-screen w-screen flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <Confetti />
          <div className="relative flex flex-col items-center rounded-3xl bg-card/80 p-6 text-center backdrop-blur-lg sm:p-8 md:p-12">
            <Avatar className="h-32 w-32 border-8 border-background shadow-lg md:h-40 md:w-40">
              <AvatarImage
                src={kidForSuccessOverlay.photoUrl}
                alt={kidForSuccessOverlay.firstName}
              />
              <AvatarFallback className="text-6xl">
                {kidForSuccessOverlay.firstName.charAt(0)}
                {kidForSuccessOverlay.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="mt-6">
              <h2 className="font-headline text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
                {`Welcome, ${kidForSuccessOverlay.firstName}!`}
              </h2>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-lg font-semibold text-primary">
              <Coins className="size-5 text-primary" />
              <span className="text-primary-foreground/90">
                {kidForSuccessOverlay.coinsBalance} Coins Total
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
