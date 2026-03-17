'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import {
  Users,
  Cake,
  Gift,
  Activity,
  UserCheck,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { AttendanceChart } from '@/components/dashboard/attendance-chart';
import { RecentActivityList } from '@/components/dashboard/recent-activity-list';
import { getDashboardStats } from '@/lib/data';
import type { DashboardStats } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


const StatCardSkeleton = () => (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="size-10 rounded-xl" />
      </CardHeader>
      <CardContent>
          <Skeleton className="h-10 w-16 mb-2" />
      </CardContent>
    </Card>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const statsData = await getDashboardStats();
        setStats(statsData);
      } catch (error) {
        console.error("Dashboard failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Live Dashboard"
        description="An overview of ministry activities."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading || !stats ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Total Kids"
              value={stats.totalKids.toString()}
              icon={Users}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
              href="/kids"
            />
            <StatCard
              title="Checked In Today"
              value={stats.kidsCheckedIn.toString()}
              icon={UserCheck}
              iconColor="text-primary-foreground"
              iconBg="bg-primary"
              href="/"
            />
            <StatCard
              title="This Month's Birthdays"
              value={stats.thisMonthsBirthdays.toString()}
              icon={Cake}
              iconColor="text-pink-600"
              iconBg="bg-pink-100"
              href="/kids?filter=this_month_birthdays"
            />
            <StatCard
              title="Total Gift Stock"
              value={stats.totalGiftStock.toString()}
              icon={Gift}
              iconColor="text-amber-700"
              iconBg="bg-amber-100"
              href="/store/manage"
            />
          </>
        )}
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5 text-primary" />
              Attendance Trend
            </CardTitle>
            <CardDescription>
              Weekly attendance for the last 8 weeks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceChart />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="size-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest check-ins and redemptions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivityList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
