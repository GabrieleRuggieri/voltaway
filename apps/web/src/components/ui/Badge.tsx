import type { ReactNode } from 'react';

type Variant = 'available' | 'charging' | 'down' | 'neutral' | 'active' | 'completed' | 'failed';

const variants: Record<Variant, string> = {
  available: 'badge badge-available',
  charging: 'badge badge-charging',
  down: 'badge badge-down',
  neutral: 'badge',
  active: 'badge badge-active',
  completed: 'badge badge-completed',
  failed: 'badge badge-failed',
};

export function Badge({
  variant = 'neutral',
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return <span className={variants[variant]}>{children}</span>;
}

export function statusVariant(status: string): Variant {
  if (status === 'AVAILABLE') return 'available';
  if (status === 'CHARGING') return 'charging';
  if (status === 'OUTOFORDER') return 'down';
  if (status === 'ACTIVE') return 'active';
  if (status === 'COMPLETED') return 'completed';
  if (status === 'FAILED') return 'failed';
  return 'neutral';
}
