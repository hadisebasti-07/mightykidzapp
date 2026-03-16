import { cn } from '@/lib/utils';

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="grid gap-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="text-base text-muted-foreground">{description}</p>
        )}
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
      </div>
      {children && (
        <div className="ml-auto flex items-center gap-2">{children}</div>
      )}
    </div>
  );
}
