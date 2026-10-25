import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'dark' | 'ghost';
type Size = 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

const variantClasses = {
  primary: 'bg-accent text-accent-fg enabled:hover:bg-accent/90',
  dark: 'bg-ink text-surface enabled:hover:bg-ink/90',
  ghost: 'bg-transparent border border-ink/20 text-ink enabled:hover:bg-raised',
};

const sizeClasses = {
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-base',
};

/** Pill button classes, also used to style links that look like buttons. */
export function buttonClasses(variant: Variant = 'primary', size: Size = 'md'): string {
  return `inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]}`;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`${buttonClasses(variant, size)} ${className}`}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
