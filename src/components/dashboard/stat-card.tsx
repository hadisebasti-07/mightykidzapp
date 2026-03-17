import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  change?: string;
  changeColor?: string;
  changeIcon?: React.ElementType;
  href?: string;
};

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  change,
  changeColor,
  changeIcon: ChangeIcon,
  href,
}: StatCardProps) {
  const cardContent = (
    <Card className={cn(
        "border-0 shadow-sm",
        href && "transition-all hover:shadow-md hover:-translate-y-0.5"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            iconBg ?? 'bg-muted'
          )}
        >
          <Icon className={cn('h-5 w-5', iconColor ?? 'text-muted-foreground')} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="break-words text-3xl font-bold tracking-tight sm:text-4xl">{value}</div>
        {change && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            {ChangeIcon && (
              <ChangeIcon className={cn('h-3 w-3', changeColor)} />
            )}
            <span className={cn(changeColor)}>{change}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
}
