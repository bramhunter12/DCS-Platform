import { cn } from '@/lib/utils';

type Condition = 'unworn' | 'excellent' | 'very_good' | 'good' | 'fair';

interface ConditionBadgeProps {
  condition: Condition;
  className?: string;
}

const conditionConfig: Record<Condition, { label: string; className: string }> = {
  unworn: {
    label: 'Unworn',
    className: 'border-primary text-primary',
  },
  excellent: {
    label: 'Excellent',
    className: 'border-foreground/70 text-foreground/70',
  },
  very_good: {
    label: 'Very Good',
    className: 'border-foreground/50 text-foreground/50',
  },
  good: {
    label: 'Good',
    className: 'border-muted-foreground text-muted-foreground',
  },
  fair: {
    label: 'Fair',
    className: 'border-muted-foreground/70 text-muted-foreground/70',
  },
};

export function ConditionBadge({ condition, className }: ConditionBadgeProps) {
  const config = conditionConfig[condition];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
