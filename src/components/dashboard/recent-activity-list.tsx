'use client';

import { getRecentActivities } from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Gift, UserCheck } from 'lucide-react';

export function RecentActivityList() {
  const activities = getRecentActivities();

  return (
    <div className="space-y-6">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage
                src={`https://picsum.photos/seed/${activity.kidName.split(' ')[0]}/100/100`}
                alt={activity.kidName}
              />
              <AvatarFallback>
                {activity.kidName.charAt(0)}
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
              <span className="font-semibold">{activity.kidName}</span>
            </p>
            <p className="text-sm text-muted-foreground">{activity.details}</p>
          </div>
          <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
        </div>
      ))}
    </div>
  );
}
