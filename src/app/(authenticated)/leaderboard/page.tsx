'use client';

import { useEffect, useState, useMemo } from 'react';
import { getKids } from '@/lib/data';
import type { Kid } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Star } from 'lucide-react';
import { withAdminOrMultimediaAuth } from '@/components/auth/with-admin-auth';
import { cn } from '@/lib/utils';

const HOUSE_COLORS = ['All', 'Red', 'Blue', 'Yellow', 'Green'] as const;

const houseColorMap: Record<string, string> = {
  Red: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200',
  Blue: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
  Yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200',
  Green: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
  All: '',
};

const houseAccentMap: Record<string, string> = {
  Red: 'bg-red-500',
  Blue: 'bg-blue-500',
  Yellow: 'bg-yellow-400',
  Green: 'bg-green-500',
  '': 'bg-primary',
};

function PodiumPlace({
  kid,
  rank,
}: {
  kid: Kid;
  rank: 1 | 2 | 3;
}) {
  const isFirst = rank === 1;
  const isSecond = rank === 2;

  const podiumConfig = {
    1: {
      height: 'h-32',
      bg: 'bg-gradient-to-t from-yellow-500 to-yellow-300',
      ring: 'ring-4 ring-yellow-400 ring-offset-2',
      avatarSize: 'size-20',
      label: 'text-yellow-600',
      icon: <Trophy className="size-5 text-yellow-500 fill-yellow-400" />,
      zIndex: 'z-10',
      order: 'order-2',
      badge: 'bg-yellow-400 text-yellow-900',
    },
    2: {
      height: 'h-24',
      bg: 'bg-gradient-to-t from-slate-400 to-slate-300',
      ring: 'ring-4 ring-slate-300 ring-offset-2',
      avatarSize: 'size-16',
      label: 'text-slate-600',
      icon: <Medal className="size-5 text-slate-400 fill-slate-300" />,
      zIndex: 'z-0',
      order: 'order-1',
      badge: 'bg-slate-300 text-slate-800',
    },
    3: {
      height: 'h-20',
      bg: 'bg-gradient-to-t from-orange-500 to-orange-300',
      ring: 'ring-4 ring-orange-300 ring-offset-2',
      avatarSize: 'size-16',
      label: 'text-orange-600',
      icon: <Medal className="size-5 text-orange-400 fill-orange-300" />,
      zIndex: 'z-0',
      order: 'order-3',
      badge: 'bg-orange-300 text-orange-900',
    },
  }[rank];

  const displayName = kid.nickname || kid.firstName;

  return (
    <div className={cn('flex flex-col items-center gap-2', podiumConfig.order)}>
      {/* Avatar + rank badge */}
      <div className="relative">
        <Avatar
          className={cn(
            podiumConfig.avatarSize,
            podiumConfig.ring,
            'transition-transform duration-200 hover:scale-105'
          )}
        >
          <AvatarImage src={kid.photoUrl} alt={displayName} />
          <AvatarFallback className="text-lg font-bold bg-muted">
            {kid.firstName[0]}
            {kid.lastName[0]}
          </AvatarFallback>
        </Avatar>

        <span
          className={cn(
            'absolute -bottom-2 -right-2 size-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md',
            podiumConfig.badge
          )}
        >
          {rank}
        </span>
      </div>

      {/* Name */}
      <div className="flex flex-col items-center gap-0.5 text-center">
        <p className={cn('font-bold text-sm leading-tight', isFirst ? 'text-base' : '')}>
          {displayName}
        </p>
        {kid.houseColor && (
          <span
            className={cn(
              'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border',
              houseColorMap[kid.houseColor] || 'bg-muted text-muted-foreground border-muted'
            )}
          >
            {kid.houseColor}
          </span>
        )}
      </div>

      {/* Coin count */}
      <div className="flex items-center gap-1 font-bold text-sm text-amber-600">
        <Star className="size-4 fill-amber-400 text-amber-400" />
        {kid.coinsBalance.toLocaleString()}
      </div>

      {/* Podium block */}
      <div
        className={cn(
          'w-24 sm:w-28 rounded-t-xl flex flex-col items-center justify-start pt-3 gap-1 shadow-lg',
          podiumConfig.height,
          podiumConfig.bg
        )}
      >
        {podiumConfig.icon}
        <span className="text-white font-black text-xl">#{rank}</span>
      </div>
    </div>
  );
}

function LeaderboardRow({
  kid,
  rank,
  isTop,
}: {
  kid: Kid;
  rank: number;
  isTop: boolean;
}) {
  const displayName = kid.nickname || kid.firstName;
  const houseColor = kid.houseColor || '';

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors',
        isTop
          ? 'bg-primary/10 border border-primary/20'
          : 'bg-card border border-border hover:bg-muted/40'
      )}
    >
      {/* Rank */}
      <div className="w-8 flex-shrink-0 text-center">
        <span
          className={cn(
            'text-sm font-bold tabular-nums',
            rank <= 10 ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {rank}
        </span>
      </div>

      {/* Avatar */}
      <Avatar className="size-10 ring-2 ring-border flex-shrink-0">
        <AvatarImage src={kid.photoUrl} alt={displayName} />
        <AvatarFallback className="text-xs font-bold bg-muted">
          {kid.firstName[0]}
          {kid.lastName[0]}
        </AvatarFallback>
      </Avatar>

      {/* Name + house */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground truncate">{kid.firstName} {kid.lastName}</p>
      </div>

      {/* House color tag */}
      {houseColor && (
        <span
          className={cn(
            'hidden sm:inline-flex text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border flex-shrink-0',
            houseColorMap[houseColor] || 'bg-muted text-muted-foreground border-muted'
          )}
        >
          {houseColor}
        </span>
      )}

      {/* Coins */}
      <div className="flex items-center gap-1 font-bold text-sm text-amber-600 flex-shrink-0">
        <Star className="size-4 fill-amber-400 text-amber-400" />
        <span className="tabular-nums">{kid.coinsBalance.toLocaleString()}</span>
      </div>
    </div>
  );
}

function LeaderboardPage() {
  const [allKids, setAllKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeHouse, setActiveHouse] = useState<string>('All');

  useEffect(() => {
    const fetchKids = async () => {
      setLoading(true);
      try {
        const data = await getKids();
        setAllKids(data);
      } finally {
        setLoading(false);
      }
    };
    fetchKids();
  }, []);

  const ranked = useMemo(() => {
    const filtered =
      activeHouse === 'All'
        ? allKids
        : allKids.filter(
            (k) => k.houseColor?.toLowerCase() === activeHouse.toLowerCase()
          );
    return [...filtered].sort((a, b) => b.coinsBalance - a.coinsBalance);
  }, [allKids, activeHouse]);

  const availableHouses = useMemo(() => {
    const houses = new Set(allKids.map((k) => k.houseColor).filter(Boolean));
    const ordered = HOUSE_COLORS.filter((h) => h === 'All' || houses.has(h));
    return ordered;
  }, [allKids]);

  const [first, second, third, ...rest] = ranked;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Leaderboard"
        description="Top performers ranked by coin balance"
      />

      {/* House filter */}
      <div className="flex flex-wrap gap-2">
        {availableHouses.map((house) => (
          <Button
            key={house}
            variant={activeHouse === house ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveHouse(house)}
            className={cn(
              'rounded-full font-semibold transition-all',
              activeHouse !== house &&
                house !== 'All' &&
                houseColorMap[house]
            )}
          >
            {house === 'All' ? 'All Houses' : `${house} House`}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-6">
          {/* Podium skeleton */}
          <div className="flex items-end justify-center gap-4">
            {[80, 100, 80].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="size-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className={`w-24 rounded-t-xl`} style={{ height: h }} />
              </div>
            ))}
          </div>
          {/* List skeleton */}
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      ) : ranked.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <Trophy className="size-16 text-muted-foreground/30" />
          <p className="text-xl font-bold text-muted-foreground">No kids yet!</p>
          <p className="text-sm text-muted-foreground">
            Add kids and they&apos;ll appear here once they earn coins.
          </p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {ranked.length >= 1 && (
            <div className="rounded-3xl bg-gradient-to-b from-primary/5 to-transparent p-6">
              <div className="flex items-end justify-center gap-3 sm:gap-6">
                {second && <PodiumPlace kid={second} rank={2} />}
                {first && <PodiumPlace kid={first} rank={1} />}
                {third && <PodiumPlace kid={third} rank={3} />}
              </div>
            </div>
          )}

          {/* Full ranked list */}
          {rest.length > 0 && (
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Rankings
              </h2>
              <div className="flex flex-col gap-2">
                {rest.map((kid, idx) => (
                  <LeaderboardRow
                    key={kid.id}
                    kid={kid}
                    rank={idx + 4}
                    isTop={idx + 4 <= 10}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default withAdminOrMultimediaAuth(LeaderboardPage);
