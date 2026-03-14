import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ElementType;
  iconColor?: string;
  change?: string;
  changeColor?: string;
  changeIcon?: React.ElementType;
};

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  change,
  changeColor,
  changeIcon: ChangeIcon,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-5 w-5 text-muted-foreground', iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{value}</div>
        {change && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {ChangeIcon && (
              <ChangeIcon className={cn('h-3 w-3', changeColor)} />
            )}
            <span className={cn(changeColor)}>{change}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
