import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helper?: string;
  error?: string;
};

/** A labelled input. An error replaces the helper text and is announced via aria-describedby. */
export function Input({ label, helper, error, id, className = '', ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const hint = error ?? helper;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        {...rest}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint ? hintId : undefined}
        className={`h-11 w-full rounded-xl border bg-surface px-4 text-ink transition-colors placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${error ? 'border-danger' : 'border-line'} ${className}`}
      />
      {hint && (
        <p id={hintId} className={`text-sm ${error ? 'text-danger' : 'text-muted'}`}>
          {hint}
        </p>
      )}
    </div>
  );
}
