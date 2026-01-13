import { FreshnessStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: FreshnessStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const statusConfig = {
    Fresh: {
      bg: 'bg-fresh',
      text: 'text-fresh-foreground',
      icon: CheckCircle2,
    },
    'Consume Soon': {
      bg: 'bg-warning',
      text: 'text-warning-foreground',
      icon: AlertTriangle,
    },
    Expired: {
      bg: 'bg-expired',
      text: 'text-expired-foreground',
      icon: XCircle,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        sizeClasses[size],
        config.bg,
        config.text
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {status}
    </span>
  );
}
