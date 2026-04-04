'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getHouseScores, addHousePoints, resetHousePoints } from '@/lib/data';
import type { HouseScore } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Confetti } from '@/components/confetti';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trophy, Crown, RotateCcw, Plus } from 'lucide-react';
import { withAdminAuth } from '@/components/auth/with-admin-auth';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_POINTS = 5000;
const BALLS_PER_ROW = 5;
const BALL_ROWS = 12;
const TOTAL_BALLS = BALLS_PER_ROW * BALL_ROWS; // 60
const BALL_SIZE = 28; // px
const BALL_GAP = 4;   // px

function getFilledCount(points: number): number {
  return Math.min(Math.round((points / MAX_POINTS) * TOTAL_BALLS), TOTAL_BALLS);
}

// ─── House config ─────────────────────────────────────────────────────────────

type HouseKey = 'red' | 'blue' | 'yellow' | 'green';

const HOUSE_CONFIG: Record<
  HouseKey,
  {
    label: string;
    ballFilled: string;
    ballEmpty: string;
    tubeBorder: string;
    tubeGlow: string;
    scoreText: string;
    badgeBg: string;
    badgeText: string;
    btnClass: string;
    cardBg: string;
    shine: string;
  }
> = {
  red: {
    label: 'Red House',
    ballFilled: 'bg-red-500 shadow-md shadow-red-400/60',
    ballEmpty: 'bg-red-100/60',
    tubeBorder: 'border-red-300',
    tubeGlow: 'shadow-red-200/80',
    scoreText: 'text-red-600',
    badgeBg: 'bg-red-500',
    badgeText: 'text-white',
    btnClass: 'bg-red-500 hover:bg-red-600 text-white border-red-500',
    cardBg: 'from-red-50/80 to-white',
    shine: 'from-white/40',
  },
  blue: {
    label: 'Blue House',
    ballFilled: 'bg-blue-500 shadow-md shadow-blue-400/60',
    ballEmpty: 'bg-blue-100/60',
    tubeBorder: 'border-blue-300',
    tubeGlow: 'shadow-blue-200/80',
    scoreText: 'text-blue-600',
    badgeBg: 'bg-blue-500',
    badgeText: 'text-white',
    btnClass: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500',
    cardBg: 'from-blue-50/80 to-white',
    shine: 'from-white/40',
  },
  yellow: {
    label: 'Yellow House',
    ballFilled: 'bg-yellow-400 shadow-md shadow-yellow-300/60',
    ballEmpty: 'bg-yellow-100/60',
    tubeBorder: 'border-yellow-300',
    tubeGlow: 'shadow-yellow-200/80',
    scoreText: 'text-yellow-600',
    badgeBg: 'bg-yellow-400',
    badgeText: 'text-yellow-900',
    btnClass: 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900 border-yellow-400',
    cardBg: 'from-yellow-50/80 to-white',
    shine: 'from-white/40',
  },
  green: {
    label: 'Green House',
    ballFilled: 'bg-green-500 shadow-md shadow-green-400/60',
    ballEmpty: 'bg-green-100/60',
    tubeBorder: 'border-green-300',
    tubeGlow: 'shadow-green-200/80',
    scoreText: 'text-green-600',
    badgeBg: 'bg-green-500',
    badgeText: 'text-white',
    btnClass: 'bg-green-500 hover:bg-green-600 text-white border-green-500',
    cardBg: 'from-green-50/80 to-white',
    shine: 'from-white/40',
  },
};

const QUICK_ADD = [10, 25, 50, 100];

// ─── BallTube Component ───────────────────────────────────────────────────────

function BallTube({
  score,
  isLeader,
  onAdd,
  onReset,
}: {
  score: HouseScore;
  isLeader: boolean;
  onAdd: (houseId: string, pts: number) => Promise<void>;
  onReset: (houseId: string) => Promise<void>;
}) {
  const config = HOUSE_CONFIG[score.id as HouseKey] ?? HOUSE_CONFIG.red;
  const filledCount = getFilledCount(score.points);
  const prevCountRef = useRef(filledCount);
  const [animatingSet, setAnimatingSet] = useState<Set<number>>(new Set());
  const [tubeShaking, setTubeShaking] = useState(false);
  const [scorePop, setScorePop] = useState(false);
  const [custom, setCustom] = useState('');

  // Trigger ball-drop animation when new balls appear
  useEffect(() => {
    const prev = prevCountRef.current;
    if (filledCount > prev) {
      const newSet = new Set<number>();
      for (let i = prev; i < filledCount; i++) newSet.add(i);
      setAnimatingSet(newSet);
      setTubeShaking(true);
      setScorePop(true);
      const t1 = setTimeout(() => setAnimatingSet(new Set()), 900);
      const t2 = setTimeout(() => setTubeShaking(false), 500);
      const t3 = setTimeout(() => setScorePop(false), 450);
      prevCountRef.current = filledCount;
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
    prevCountRef.current = filledCount;
  }, [filledCount]);

  const handleAdd = (pts: number) => {
    onAdd(score.id, pts);
  };

  const handleCustomAdd = () => {
    const pts = parseInt(custom, 10);
    if (!pts || pts <= 0) return;
    setCustom('');
    onAdd(score.id, pts);
  };

  const fillPct = Math.round((score.points / MAX_POINTS) * 100);

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-4 rounded-3xl p-5 border transition-all duration-300',
        `bg-gradient-to-b ${config.cardBg}`,
        isLeader
          ? 'border-yellow-300 shadow-xl shadow-yellow-100/60 ring-2 ring-yellow-300/50'
          : 'border-border shadow-sm'
      )}
    >
      {/* House label */}
      <div className="flex items-center gap-2">
        {isLeader && <Crown className="size-5 text-yellow-500 fill-yellow-400" />}
        <span
          className={cn(
            'px-3 py-1 rounded-full text-sm font-bold',
            config.badgeBg,
            config.badgeText
          )}
        >
          {config.label}
        </span>
        {isLeader && <Crown className="size-5 text-yellow-500 fill-yellow-400" />}
      </div>

      {/* Score */}
      <div className="text-center leading-none">
        <p
          className={cn(
            'text-5xl font-black tabular-nums transition-transform',
            config.scoreText,
            scorePop && 'animate-score-pop'
          )}
        >
          {score.points.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          {fillPct}% of tube filled
        </p>
      </div>

      {/* Tube */}
      <div
        className={cn(
          'relative rounded-b-[40px] rounded-t-2xl border-4 overflow-hidden shadow-lg',
          config.tubeBorder,
          config.tubeGlow,
          tubeShaking && 'animate-tube-shake'
        )}
        style={{ width: 172, height: 396, background: 'rgba(255,255,255,0.55)' }}
      >
        {/* Balls grid — flex-wrap-reverse fills from bottom */}
        {/* inset-2 = 8px each side → inner 132px; 4 balls×28px + 3 gaps×4px = 124px ✓ */}
        <div
          className="absolute inset-2 flex flex-wrap-reverse content-start"
          style={{ gap: BALL_GAP, width: BALLS_PER_ROW * BALL_SIZE + (BALLS_PER_ROW - 1) * BALL_GAP }}
        >
          {Array.from({ length: TOTAL_BALLS }).map((_, i) => {
            const filled = i < filledCount;
            const isNew = animatingSet.has(i);
            return (
              <div
                key={i}
                className={cn(
                  'rounded-full transition-colors duration-200',
                  filled ? config.ballFilled : config.ballEmpty,
                  isNew && 'animate-ball-drop'
                )}
                style={{
                  width: BALL_SIZE,
                  height: BALL_SIZE,
                  animationDelay: isNew ? `${(i - (filledCount - animatingSet.size)) * 60}ms` : undefined,
                }}
              />
            );
          })}
        </div>

        {/* Glass shine */}
        <div
          className={cn(
            'absolute top-0 left-0 w-6 h-full pointer-events-none rounded-l-[36px]',
            `bg-gradient-to-r ${config.shine} to-transparent`
          )}
        />

        {/* Overflow indicator */}
        {score.points >= MAX_POINTS && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white font-black text-2xl drop-shadow-lg rotate-12 opacity-80">
              FULL!
            </span>
          </div>
        )}
      </div>

      {/* Quick-add buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {QUICK_ADD.map((pts) => (
          <button
            key={pts}
            onClick={() => handleAdd(pts)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-bold border transition-all active:scale-95',
              config.btnClass
            )}
          >
            +{pts}
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="flex gap-2 w-full">
        <Input
          type="number"
          min={1}
          placeholder="Custom pts"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
          className="h-9 text-sm text-center"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleCustomAdd}
          disabled={!custom}
          className="px-3 shrink-0"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Reset */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
            <RotateCcw className="size-3" />
            Reset
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset {config.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will set their score back to 0. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onReset(score.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function HousePointsPage() {
  const [scores, setScores] = useState<HouseScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const fetchScores = useCallback(async () => {
    const data = await getHouseScores();
    setScores(data);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchScores().finally(() => setLoading(false));
  }, [fetchScores]);

  const handleAdd = useCallback(
    (houseId: string, pts: number) => {
      // Optimistic update — instant UI response
      setScores((prev) =>
        prev.map((s) =>
          s.id === houseId
            ? { ...s, points: s.points + pts, updatedAt: new Date().toISOString() }
            : s
        )
      );
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      // Background write — doesn't block the animation
      addHousePoints(houseId, pts).catch((err: any) => {
        console.error('[HousePoints] addHousePoints failed:', err);
        // Rollback
        setScores((prev) =>
          prev.map((s) =>
            s.id === houseId
              ? { ...s, points: Math.max(0, s.points - pts) }
              : s
          )
        );
        toast({
          variant: 'destructive',
          title: 'Failed to add points',
          description: err?.message ?? String(err),
        });
      });
    },
    [toast]
  );

  const handleReset = useCallback(
    async (houseId: string) => {
      try {
        await resetHousePoints(houseId);
        setScores((prev) =>
          prev.map((s) =>
            s.id === houseId
              ? { ...s, points: 0, updatedAt: new Date().toISOString() }
              : s
          )
        );
        toast({ title: 'Score reset', description: `${houseId} house is back to 0.` });
      } catch {
        toast({ variant: 'destructive', title: 'Failed to reset' });
      }
    },
    [toast]
  );

  const maxPoints = Math.max(...scores.map((s) => s.points), 0);
  const leaders = scores.filter((s) => s.points === maxPoints && maxPoints > 0);
  const totalPoints = scores.reduce((sum, s) => sum + s.points, 0);

  return (
    <>
      {showConfetti && <Confetti />}

      <div className="flex flex-col gap-8">
        <PageHeader
          title="House Points"
          description="Fill your tube to claim victory!"
        />

        {/* Total banner */}
        {!loading && totalPoints > 0 && (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20 px-6 py-4">
            <Trophy className="size-6 text-primary fill-primary/20" />
            <span className="font-bold text-lg">
              {totalPoints.toLocaleString()} total points across all houses
            </span>
            <Trophy className="size-6 text-primary fill-primary/20" />
          </div>
        )}

        {/* Tubes grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-4 p-5 rounded-3xl border">
                <Skeleton className="h-7 w-28 rounded-full" />
                <Skeleton className="h-12 w-20" />
                <Skeleton className="rounded-[40px] rounded-t-2xl" style={{ width: 172, height: 396 }} />
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-7 w-12 rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {scores.map((score) => (
              <BallTube
                key={score.id}
                score={score}
                isLeader={leaders.some((l) => l.id === score.id)}
                onAdd={handleAdd}
                onReset={handleReset}
              />
            ))}
          </div>
        )}

        {/* Legend */}
        <p className="text-center text-xs text-muted-foreground">
          Tube is full at {MAX_POINTS.toLocaleString()} points · Each ball ≈ {Math.round(MAX_POINTS / TOTAL_BALLS)} points
        </p>
      </div>
    </>
  );
}

export default withAdminAuth(HousePointsPage);
