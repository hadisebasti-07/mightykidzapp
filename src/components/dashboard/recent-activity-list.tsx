'use client';

import { useEffect, useState } from 'react';
import { getRecentActivities } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { RecentActivity } from '@/lib/types';

const ActivitySkeleton = () => (
    <div className="flex items-start gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
        </div>
    </div>
);

export function RecentActivityList() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
        setLoading(true);
        const activityData = await getRecentActivities();
        setActivities(activityData);
        setLoading(false);
    };
    fetchActivities();
  }, []);

  if (loading) {
    return (
        <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => <ActivitySkeleton key={i} />)}
        </div>
    )
  }

  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage
                src={activity.photoUrl}
                alt={activity.kidName}
              />
              <AvatarFallback>
                {activity.kidName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                'absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full',
                activity.type === 'check-in' ? 'bg-blue-500' : 'bg-accent'
              )}
            >
              <activity.icon className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              <span className="font-semibold">{activity.kidName}</span> {activity.details}
            </p>
             <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
