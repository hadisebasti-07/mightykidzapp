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
  CalendarCheck,
  Cake,
  Gift,
  ArrowUp,
  Activity,
  UserCheck,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/stat-card';
import { AttendanceChart } from '@/components/dashboard/attendance-chart';
import { RecentActivityList } from '@/components/dashboard/recent-activity-list';
import { getDashboardStats } from '@/lib/data';

export default function DashboardPage() {
  const stats = getDashboardStats();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Sunday Live Dashboard"
        description="A real-time overview of today's ministry activities."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Kids Checked In"
          value={stats.kidsCheckedIn.toString()}
          icon={Users}
          change="+5 this week"
          changeColor="text-green-500"
          changeIcon={ArrowUp}
        />
        <StatCard
          title="Volunteers on Duty"
          value={stats.volunteersOnDuty.toString()}
          icon={CalendarCheck}
        />
        <StatCard
          title="Today's Birthdays"
          value={stats.todaysBirthdays.toString()}
          icon={Cake}
          iconColor="text-pink-500"
        />
        <StatCard
          title="Gifts Redeemed"
          value={stats.giftsRedeemed.toString()}
          icon={Gift}
          iconColor="text-accent"
        />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="size-5" />
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
