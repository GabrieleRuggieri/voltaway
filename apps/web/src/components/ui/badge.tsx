/**
 * @file Badge.tsx
 * @module @voltaway/web
 *
 * Scopo: badge di stato per EVSE e sessioni (AVAILABLE, ACTIVE, FAILED, …).
 * Flusso: status string → statusVariant() → colore semantico in UI.
 * Dipendenze: class-variance-authority, @/lib/utils.
 */
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-white/60 bg-white/50 text-foreground backdrop-blur-sm',
        available: 'border-emerald-200/80 bg-emerald-50/90 text-emerald-700 backdrop-blur-sm',
        charging: 'border-amber-200/80 bg-amber-50/90 text-amber-700 backdrop-blur-sm',
        down: 'border-red-200/80 bg-red-50/90 text-red-700 backdrop-blur-sm',
        active:
          'border-cyan-200/80 bg-cyan-50/90 text-cyan-700 shadow-sm shadow-cyan-500/10 backdrop-blur-sm',
        completed: 'border-emerald-200/80 bg-emerald-50/90 text-emerald-700 backdrop-blur-sm',
        failed: 'border-red-200/80 bg-red-50/90 text-red-700 backdrop-blur-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

/** Mappa stati OCPI/sessione alle varianti colore del badge. */
export function statusVariant(status: string) {
  if (status === 'AVAILABLE') return 'available' as const;
  if (status === 'CHARGING') return 'charging' as const;
  if (status === 'OUTOFORDER') return 'down' as const;
  if (status === 'ACTIVE') return 'active' as const;
  if (status === 'COMPLETED') return 'completed' as const;
  if (status === 'FAILED') return 'failed' as const;
  return 'outline' as const;
}
