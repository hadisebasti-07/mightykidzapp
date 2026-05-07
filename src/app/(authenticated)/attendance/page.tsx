'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAttendanceReport } from '@/lib/data';
import { AttendanceReportRow } from '@/lib/types';
import { PageHeader } from '@/components/page-header';
import { withAdminAuth } from '@/components/auth/with-admin-auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users, CalendarCheck, TrendingUp, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HOUSE_DOTS: Record<string, string> = {
  Red:    'bg-red-500',
  Blue:   'bg-blue-500',
  Green:  'bg-green-500',
  Yellow: 'bg-yellow-400',
};

const PERIODS = [
  { label: 'Last 4 weeks',  days: 28 },
  { label: 'Last 8 weeks',  days: 56 },
  { label: 'Last 3 months', days: 90 },
  { label: 'Last 6 months', days: 180 },
  { label: 'This year',     days: -1 },
] as const;

type SortKey = 'percentage' | 'firstName' | 'attended';
type SortDir = 'asc' | 'desc';

function getPctBadge(pct: number) {
  if (pct >= 80) return 'bg-green-100 text-green-700 border-green-200';
  if (pct >= 50) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-red-100 text-red-700 border-red-200';
}

function startDateForPeriod(days: number): Date {
  if (days === -1) {
    const d = new Date();
    d.setMonth(0, 1);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function AttendancePage() {
  const [periodDays, setPeriodDays] = useState<number>(56);
  const [rows, setRows]             = useState<AttendanceReportRow[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [sortKey, setSortKey]       = useState<SortKey>('percentage');
  const [sortDir, setSortDir]       = useState<SortDir>('desc');
  const [classFilter, setClassFilter] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    getAttendanceReport(startDateForPeriod(periodDays))
      .then(({ rows: r, totalSessions: ts }) => {
        setRows(r);
        setTotalSessions(ts);
      })
      .finally(() => setLoading(false));
  }, [periodDays]);

  const availableClasses = useMemo(
    () => [...new Set(rows.map(r => r.className).filter(Boolean) as string[])].sort(),
    [rows]
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir(key === 'firstName' ? 'asc' : 'desc');
    }
  };

  const displayed = useMemo(() => {
    let list = rows;
    if (classFilter !== 'all') {
      list = list.filter(r => r.className === classFilter);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(r =>
        r.firstName.toLowerCase().includes(term) ||
        r.lastName.toLowerCase().includes(term)
      );
    }
    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'percentage') cmp = a.percentage - b.percentage;
      else if (sortKey === 'attended') cmp = a.attended - b.attended;
      else cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, classFilter, search, sortKey, sortDir]);

  const attended1Plus = rows.filter(r => r.attended > 0).length;
  const avgPct = rows.length > 0
    ? Math.round(rows.reduce((s, r) => s + r.percentage, 0) / rows.length)
    : 0;

  const SortButton = ({ label, col }: { label: string; col: SortKey }) => (
    <button
      onClick={() => toggleSort(col)}
      className="flex items-center gap-1 hover:text-foreground"
    >
      {label}
      <ArrowUpDown className={`h-3.5 w-3.5 ${sortKey === col ? 'text-primary' : 'opacity-40'}`} />
    </button>
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Attendance Report"
        description="Track how consistently each kid attends over a given period."
      >
        <Select value={String(periodDays)} onValueChange={v => setPeriodDays(Number(v))}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map(p => (
              <SelectItem key={p.days} value={String(p.days)}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarCheck className="h-4 w-4" /> Sessions held
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-12" /> : (
              <p className="text-3xl font-bold">{totalSessions}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" /> Active kids
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-3xl font-bold">{attended1Plus} <span className="text-base font-normal text-muted-foreground">/ {rows.length}</span></p>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="pb-1 pt-4">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" /> Avg attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <p className={`text-3xl font-bold ${avgPct >= 80 ? 'text-green-600' : avgPct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                {avgPct}%
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {availableClasses.length > 0 && (
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="All classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {availableClasses.map(c => (
                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="text-xs uppercase tracking-wider text-muted-foreground">
              <TableHead className="w-10 pl-4">#</TableHead>
              <TableHead>
                <SortButton label="Name" col="firstName" />
              </TableHead>
              <TableHead className="hidden sm:table-cell">Class</TableHead>
              <TableHead className="hidden md:table-cell">House</TableHead>
              <TableHead className="text-center">
                <SortButton label="Attended" col="attended" />
              </TableHead>
              <TableHead className="text-center hidden sm:table-cell">Sessions</TableHead>
              <TableHead className="text-right pr-4">
                <SortButton label="%" col="percentage" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="mx-auto h-4 w-8" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="mx-auto h-4 w-8" /></TableCell>
                  <TableCell><Skeleton className="ml-auto h-6 w-14" /></TableCell>
                </TableRow>
              ))
            ) : displayed.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  No kids found.
                </TableCell>
              </TableRow>
            ) : (
              displayed.map((row, i) => (
                <TableRow key={row.kidId} className="hover:bg-muted/30">
                  <TableCell className="pl-4 text-sm font-medium text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={row.photoUrl} alt={row.firstName} />
                        <AvatarFallback className="text-xs font-bold">
                          {row.firstName.charAt(0)}{row.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold leading-tight">{row.firstName} {row.lastName}</p>
                        {row.status && (
                          <p className="text-xs capitalize text-muted-foreground">{row.status}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {row.className
                      ? <Badge variant="secondary" className="capitalize">{row.className}</Badge>
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {row.houseColor ? (
                      <span className="flex items-center gap-1.5 text-sm">
                        <span className={`h-2.5 w-2.5 rounded-full ${HOUSE_DOTS[row.houseColor] ?? 'bg-muted'}`} />
                        {row.houseColor}
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-center font-semibold">{row.attended}</TableCell>
                  <TableCell className="hidden text-center text-muted-foreground sm:table-cell">{row.totalSessions}</TableCell>
                  <TableCell className="pr-4 text-right">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${getPctBadge(row.percentage)}`}>
                      {row.percentage}%
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!loading && displayed.length > 0 && (
          <p className="px-4 py-2.5 text-xs text-muted-foreground border-t">
            Showing {displayed.length} of {rows.length} kids
          </p>
        )}
      </div>
    </div>
  );
}

export default withAdminAuth(AttendancePage);
