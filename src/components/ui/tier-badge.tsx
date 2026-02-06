import { cn } from '@/lib/utils';

export type Tier = 'buyer' | 'observer' | 'individual_seller' | 'super_seller' | 'admin';

interface TierBadgeProps {
  tier: Tier;
  className?: string;
}

const tierConfig: Record<Tier, { label: string; className: string }> = {
  buyer: {
    label: 'Buyer',
    className: 'bg-muted text-muted-foreground',
  },
  observer: {
    label: 'Private Holder',
    className: 'bg-muted text-muted-foreground border border-border',
  },
  individual_seller: {
    label: 'Verified Dealer',
    className: 'bg-secondary text-secondary-foreground',
  },
  super_seller: {
    label: 'Certified Partner',
    className: 'bg-primary text-primary-foreground',
  },
  admin: {
    label: 'Admin',
    className: 'bg-destructive text-destructive-foreground',
  },
};

export function TierBadge({ tier, className }: TierBadgeProps) {
  const config = tierConfig[tier] || tierConfig.buyer;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium tracking-wide uppercase',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}