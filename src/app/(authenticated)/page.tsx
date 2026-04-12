'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  UserCheck,
  X,
  UserPlus,
  Coins,
  CheckCircle2,
  Users,
  Zap,
} from 'lucide-react';
import { getKids, getRecentActivities, checkInKid, getTodayCheckedInKidIds } from '@/lib/data';
import { Kid } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Confetti } from '@/components/confetti';
import { Skeleton } from '@/components/ui/skeleton';

// ── Decorative shapes ────────────────────────────────────────────────────────

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

function Bolt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2L4.09 12.97H11L10 22l8.91-10.97H13L14 2z" />
    </svg>
  );
}

function Diamond({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l10 10-10 10L2 12z" />
    </svg>
  );
}

// ── House colour config ───────────────────────────────────────────────────────

const HOUSE_STYLES: Record<string, { dot: string; border: string; fallback: string }> = {
  Red:    { dot: 'bg-red-500',    border: 'border-l-red-400',    fallback: 'bg-red-100 text-red-700' },
  Blue:   { dot: 'bg-blue-500',   border: 'border-l-blue-400',   fallback: 'bg-blue-100 text-blue-700' },
  Green:  { dot: 'bg-green-500',  border: 'border-l-green-500',  fallback: 'bg-green-100 text-green-700' },
  Yellow: { dot: 'bg-yellow-400', border: 'border-l-yellow-400', fallback: 'bg-yellow-100 text-yellow-700' },
};

// ── Kid row ───────────────────────────────────────────────────────────────────

function KidRow({ kid, checked, onCheckIn }: { kid: Kid; checked: boolean; onCheckIn: () => void }) {
  const house = kid.houseColor ? HOUSE_STYLES[kid.houseColor] : null;
  return (
    <div className={`flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm transition-all sm:gap-4 sm:p-4
      ${house ? `border-l-4 ${house.border}` : 'border-l-4 border-l-primary/30'}
      ${checked ? 'opacity-60' : 'hover:-translate-y-0.5 hover:shadow-md'}`}
    >
      <Avatar className="h-14 w-14 shrink-0 ring-2 ring-background ring-offset-2 ring-offset-card sm:h-16 sm:w-16">
        <AvatarImage src={kid.photoUrl} alt={kid.firstName} />
        <AvatarFallback className={`text-lg font-bold ${house ? house.fallback : 'bg-primary/10 text-primary'}`}>
          {kid.firstName.charAt(0)}{kid.lastName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-base font-bold sm:text-lg">{kid.firstName} {kid.lastName}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {kid.className && <Badge variant="secondary" className="h-5 px-1.5 text-xs capitalize">{kid.className}</Badge>}
          {kid.houseColor && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className={`h-2 w-2 rounded-full ${house?.dot}`} />{kid.houseColor}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{kid.parentName}</p>
      </div>
      <Button
        className={`h-10 shrink-0 rounded-xl px-4 text-sm font-semibold sm:h-11 sm:px-5
          ${checked ? 'bg-green-100 text-green-700 hover:bg-green-100 cursor-default' : ''}`}
        onClick={onCheckIn}
        disabled={checked}
        variant={checked ? 'ghost' : 'default'}
      >
        {checked ? <><CheckCircle2 className="mr-1.5 h-4 w-4 text-green-600" />Done</>
                 : <><UserCheck className="mr-1.5 h-4 w-4" />Check In</>}
      </Button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [allKids, setAllKids] = useState<Kid[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Kid[]>([]);
  const [quickCheckInKids, setQuickCheckInKids] = useState<Kid[]>([]);
  const [kidForSuccessOverlay, setKidForSuccessOverlay] = useState<Kid | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [checkedInKidIds, setCheckedInKidIds] = useState<Set<string>>(new Set());
  const [loadingInitial, setLoadingInitial] = useState(true);

  const { toast } = useToast();
  const allKidsRef = useRef(allKids);
  useEffect(() => { allKidsRef.current = allKids; }, [allKids]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const BARCODE_PATTERN = useMemo(() => /^MKC-\d{3}-\d{6}$/, []);
  const todayLabel = useMemo(() =>
    new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }), []);

  // Focus on mount
  useEffect(() => {
    const f = () => searchInputRef.current?.focus();
    const t1 = setTimeout(f, 0);
    const t2 = setTimeout(f, 150);
    const t3 = setTimeout(f, 500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Global keydown → search input (barcode scanner safety net)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const interactive = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement).isContentEditable;
      if (!interactive) searchInputRef.current?.focus();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Re-focus after success closes
  useEffect(() => {
    if (!showSuccess) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [showSuccess]);

  const handleCheckIn = useCallback(async (kid: Kid) => {
    setCheckedInKidIds(prev => new Set(prev).add(kid.id));
    setKidForSuccessOverlay({ ...kid, coinsBalance: kid.coinsBalance + 10 });
    setShowSuccess(true);
    try {
      await checkInKid(kid.id);
      const refreshed = await getKids();
      setAllKids(refreshed);
      setSearchResults(prev => prev.map(k => k.id === kid.id ? refreshed.find(r => r.id === kid.id) || k : k));
      setQuickCheckInKids(prev => prev.map(k => k.id === kid.id ? refreshed.find(r => r.id === kid.id) || k : k));
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Check-in Failed', description: e.message || 'Could not sync. Please try again.' });
      setShowSuccess(false);
      setKidForSuccessOverlay(null);
      setCheckedInKidIds(prev => { const s = new Set(prev); s.delete(kid.id); return s; });
    }
  }, [toast]);

  const processScan = useCallback((value: string) => {
    const kid = allKidsRef.current.find(k => k.barcode === value)
             ?? allKidsRef.current.find(k => k.id === value);
    if (kid) {
      if (checkedInKidIds.has(kid.id)) {
        toast({ title: 'Already Checked In', description: `${kid.firstName} is already checked in today.` });
        return;
      }
      handleCheckIn(kid);
    } else {
      toast({ variant: 'destructive', title: 'Kid Not Found', description: `No kid found for: ${value}` });
    }
  }, [handleCheckIn, toast, checkedInKidIds]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingInitial(true);
      const [kidsData, checkedInIds, recentActivities] = await Promise.all([
        getKids(), getTodayCheckedInKidIds(), getRecentActivities(),
      ]);
      setAllKids(kidsData);
      allKidsRef.current = kidsData;
      setCheckedInKidIds(new Set(checkedInIds));
      const names = [...new Set(
        recentActivities
          .filter(a => a.type === 'check-in' && !checkedInIds.includes(a.kidId))
          .map(a => a.kidName)
      )];
      setQuickCheckInKids(
        names.map(n => kidsData.find(k => `${k.firstName} ${k.lastName}` === n))
             .filter((k): k is Kid => !!k)
             .slice(0, 4)
      );
      setLoadingInitial(false);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (showSuccess) {
      const t = setTimeout(() => { setShowSuccess(false); setKidForSuccessOverlay(null); }, 8000);
      return () => clearTimeout(t);
    }
  }, [showSuccess]);

  const handleSearch = () => {
    if (!searchTerm.trim()) { setSearchResults([]); return; }
    const term = searchTerm.toLowerCase();
    setSearchResults(allKids.filter(k =>
      k.firstName.toLowerCase().includes(term) ||
      k.lastName.toLowerCase().includes(term) ||
      k.parentName.toLowerCase().includes(term) ||
      k.parentPhone.includes(searchTerm)
    ));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (BARCODE_PATTERN.test(value)) { setSearchTerm(''); processScan(value); }
  };

  const KidRowSkeleton = () => (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-3 sm:gap-4 sm:p-4">
      <Skeleton className="h-14 w-14 shrink-0 rounded-full sm:h-16 sm:w-16" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-10 w-24 rounded-xl" />
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-6">

        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ background: 'linear-gradient(135deg, hsl(113,38%,11%) 0%, hsl(113,38%,16%) 50%, hsl(280,40%,18%) 100%)' }}>

          {/* Dot grid */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.15]"
            style={{ backgroundImage: 'radial-gradient(circle, hsl(113,60%,60%) 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />

          {/* Floating decorations */}
          <Star className="animate-float absolute left-6 top-6 h-8 w-8 text-yellow-400 opacity-90 drop-shadow-lg" />
          <Star className="animate-float-alt absolute right-10 top-8 h-5 w-5 text-yellow-300 opacity-70" />
          <Star className="animate-float absolute left-1/4 bottom-6 h-6 w-6 text-orange-400 opacity-80 drop-shadow" />
          <Star className="animate-float-alt absolute right-1/4 bottom-8 h-4 w-4 text-pink-400 opacity-70" />
          <Bolt className="animate-wiggle absolute right-6 top-1/2 h-10 w-10 -translate-y-1/2 text-yellow-300 opacity-60 drop-shadow-lg" />
          <Bolt className="animate-wiggle absolute left-8 top-1/2 h-7 w-7 -translate-y-1/2 text-orange-300 opacity-50 drop-shadow" style={{ animationDelay: '0.5s' }} />
          <Diamond className="animate-spin-slow absolute right-16 bottom-4 h-5 w-5 text-pink-400 opacity-60" />
          <Diamond className="animate-spin-slow absolute left-16 top-4 h-4 w-4 text-blue-400 opacity-50" style={{ animationDelay: '3s' }} />

          {/* Big glow blobs */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full" style={{ background: 'hsl(280,50%,40%)', opacity: 0.2, filter: 'blur(60px)' }} />
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-2xl" />

          {/* Register button */}
          <div className="absolute right-4 top-4 z-10">
            <Button asChild size="sm" variant="ghost" className="text-white/50 hover:bg-white/10 hover:text-white">
              <Link href="/kids/new"><UserPlus className="mr-1.5 h-4 w-4" />Register</Link>
            </Button>
          </div>

          {/* Main content */}
          <div className="relative flex flex-col items-center gap-4 px-6 py-10 text-center text-white sm:py-14">

            {/* Logo */}
            <div className="relative">
              <div className="absolute inset-0 scale-[1.8] rounded-full bg-primary/20 blur-3xl" />
              <Image
                src="/logo.png"
                alt="MightyKidz"
                width={270}
                height={227}
                className="relative h-36 w-auto drop-shadow-2xl sm:h-44"
                priority
              />
            </div>

            {/* Copy */}
            <div className="space-y-1">
              <h1 className="font-headline text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                Ready for an{' '}
                <span className="text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]">EPIC</span>
                {' '}Sunday?
              </h1>
              <p className="text-base text-white/65">Scan your badge or search below to check in!</p>
            </div>

            {/* Live counter */}
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-5 py-2 ring-1 ring-white/15 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              <span className="text-sm font-bold text-primary">{checkedInKidIds.size}</span>
              <span className="text-sm text-white/60">kids checked in today</span>
              <span className="text-xs text-white/40">·</span>
              <span className="text-xs text-white/50">{todayLabel}</span>
            </div>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="mx-auto w-full max-w-3xl space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scanner ready</span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, parent or phone…"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-14 rounded-2xl bg-card pl-12 pr-32 text-base shadow-sm"
              />
              <Button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-xl px-5 text-sm"
              >
                Search
              </Button>
            </div>
            <Button asChild className="h-14 w-14 shrink-0 rounded-2xl sm:hidden" title="Register new kid">
              <Link href="/kids/new"><UserPlus className="h-5 w-5" /></Link>
            </Button>
          </div>
        </div>

        {/* ── Search results ── */}
        {searchResults.length > 0 && (
          <div className="mx-auto w-full max-w-3xl space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-semibold text-muted-foreground">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </p>
              <Button variant="ghost" size="sm" onClick={() => { setSearchResults([]); setSearchTerm(''); }}>
                <X className="mr-1.5 h-3.5 w-3.5" />Clear
              </Button>
            </div>
            {searchResults.map(kid => (
              <KidRow key={kid.id} kid={kid} checked={checkedInKidIds.has(kid.id)} onCheckIn={() => handleCheckIn(kid)} />
            ))}
          </div>
        )}

        {/* ── Recently Here ── */}
        {searchResults.length === 0 && (
          <div className="mx-auto w-full max-w-3xl space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Recently Here</h2>
            </div>
            {loadingInitial ? (
              <><KidRowSkeleton /><KidRowSkeleton /><KidRowSkeleton /></>
            ) : quickCheckInKids.length > 0 ? (
              quickCheckInKids.map(kid => (
                <KidRow key={kid.id} kid={kid} checked={checkedInKidIds.has(kid.id)} onCheckIn={() => handleCheckIn(kid)} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed bg-card p-10 text-center text-muted-foreground">
                <Users className="mx-auto mb-3 h-8 w-8 opacity-30" />
                <p className="text-sm">No recent check-ins. Search or scan a badge to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Success overlay ── */}
      {showSuccess && kidForSuccessOverlay && (
        <div
          className="fixed inset-0 z-50 flex h-screen w-screen cursor-pointer flex-col items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => { setShowSuccess(false); setKidForSuccessOverlay(null); }}
        >
          <Confetti />

          <div className="relative flex flex-col items-center gap-5 rounded-3xl bg-card p-8 text-center shadow-2xl sm:p-12"
               style={{ maxWidth: '420px', width: '90%' }}>

            {/* Decorative stars on the card */}
            <Star className="animate-float absolute -left-4 -top-4 h-8 w-8 text-yellow-400 drop-shadow-lg" />
            <Star className="animate-float-alt absolute -right-3 -top-3 h-6 w-6 text-orange-400 drop-shadow" />
            <Star className="animate-float absolute -bottom-3 left-8 h-5 w-5 text-pink-400 drop-shadow" />

            {/* Glow ring */}
            <div className="absolute inset-0 rounded-3xl ring-4 ring-primary/40" />

            <Avatar className="h-36 w-36 ring-4 ring-primary ring-offset-4 ring-offset-card md:h-44 md:w-44">
              <AvatarImage src={kidForSuccessOverlay.photoUrl} alt={kidForSuccessOverlay.firstName} />
              <AvatarFallback className="bg-primary/10 text-5xl font-bold text-primary">
                {kidForSuccessOverlay.firstName.charAt(0)}{kidForSuccessOverlay.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Welcome back!</p>
              <h2 className="font-headline mt-1 text-5xl font-extrabold md:text-6xl">
                {kidForSuccessOverlay.firstName}!
              </h2>
              {kidForSuccessOverlay.className && (
                <Badge variant="secondary" className="mt-2 capitalize">{kidForSuccessOverlay.className}</Badge>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-6 py-3 text-primary">
              <Coins className="h-5 w-5" />
              <span className="text-2xl font-extrabold">{kidForSuccessOverlay.coinsBalance}</span>
              <span className="text-sm font-medium text-primary/70">coins total</span>
              <span className="rounded-full bg-primary/20 px-2.5 py-1 text-xs font-extrabold">+10</span>
            </div>

            <p className="text-xs text-muted-foreground">Tap anywhere to continue</p>
          </div>
        </div>
      )}
    </>
  );
}
