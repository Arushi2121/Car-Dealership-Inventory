import type { ReactNode } from 'react';

type BadgeProps = {
  tone?: 'great' | 'fair' | 'above' | 'neutral';
  children: ReactNode;
};

const toneClasses = {
  great: 'bg-great/10 text-great',
  above: 'bg-above/10 text-above',
  fair: 'border border-line bg-surface text-muted',
  neutral: 'border border-line bg-surface text-muted',
};

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}
