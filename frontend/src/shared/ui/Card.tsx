import type { HTMLAttributes } from 'react';

export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={`overflow-hidden rounded-card border border-line bg-surface ${className}`}
    />
  );
}
