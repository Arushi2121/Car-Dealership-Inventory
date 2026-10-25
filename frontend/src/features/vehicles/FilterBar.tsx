import { useEffect, useId, useRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { bodyStyleNames, categories, type Category } from '../../shared/lib/categories';
import { Button, Input } from '../../shared/ui';
import { sortOptions, type Filters, type Sort } from './filters';

const DEBOUNCE_MS = 300;

const selectClasses =
  'h-11 w-full rounded-xl border border-line bg-surface px-4 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

type DebouncedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  label: string;
  value: string;
  onCommit: (value: string) => void;
};

/** Keeps what the user types locally and commits it after a pause, so each keystroke isn't a request. */
function DebouncedInput({ value, onCommit, ...rest }: DebouncedInputProps) {
  const [draft, setDraft] = useState(value);
  const [committed, setCommitted] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The URL changed from elsewhere (Clear, Back): show that value instead of the draft.
  if (value !== committed) {
    setCommitted(value);
    setDraft(value);
  }

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <Input
      {...rest}
      value={draft}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => onCommit(next), DEBOUNCE_MS);
      }}
    />
  );
}

function toPrice(value: string): number | null {
  return value === '' ? null : Number(value);
}

type FilterBarProps = {
  filters: Filters;
  resultCount: number;
  onChange: (changes: Partial<Filters>) => void;
  onClear: () => void;
};

export function FilterBar({ filters, resultCount, onChange, onClear }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const categoryId = useId();
  const sortId = useId();

  return (
    <div className="sticky top-16 z-30 -mx-6 bg-canvas/90 px-6 py-3 backdrop-blur">
      <div className="rounded-card border border-line bg-surface p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <DebouncedInput
              type="search"
              label="Search make or model"
              placeholder="Toyota, Civic…"
              value={filters.q}
              onCommit={(q) => onChange({ q })}
            />
          </div>
          <Button
            variant="ghost"
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="h-11 md:hidden"
          >
            Filters
          </Button>
        </div>

        <div
          className={`${open ? 'grid' : 'hidden'} mt-4 gap-3 sm:grid-cols-2 md:grid md:grid-cols-3 lg:flex lg:items-end`}
        >
          <div className="space-y-1.5 lg:w-44">
            <label htmlFor={categoryId} className="block text-sm font-medium text-ink">
              Body style
            </label>
            <select
              id={categoryId}
              value={filters.category}
              onChange={(event) => onChange({ category: event.target.value as Category | '' })}
              className={selectClasses}
            >
              <option value="">All body styles</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {bodyStyleNames[category]}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:w-32">
            <DebouncedInput
              type="number"
              min={0}
              inputMode="numeric"
              label="Min price ($)"
              value={filters.minPrice === null ? '' : String(filters.minPrice)}
              onCommit={(value) => onChange({ minPrice: toPrice(value) })}
            />
          </div>
          <div className="lg:w-32">
            <DebouncedInput
              type="number"
              min={0}
              inputMode="numeric"
              label="Max price ($)"
              value={filters.maxPrice === null ? '' : String(filters.maxPrice)}
              onCommit={(value) => onChange({ maxPrice: toPrice(value) })}
            />
          </div>

          <div className="space-y-1.5 lg:w-48">
            <label htmlFor={sortId} className="block text-sm font-medium text-ink">
              Sort
            </label>
            <select
              id={sortId}
              value={filters.sort}
              onChange={(event) => onChange({ sort: event.target.value as Sort })}
              className={selectClasses}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex h-11 cursor-pointer items-center gap-3 text-sm font-medium text-ink">
            <input
              type="checkbox"
              role="switch"
              checked={filters.inStock}
              onChange={(event) => onChange({ inStock: event.target.checked })}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative h-6 w-11 rounded-pill bg-line transition-colors peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-surface after:transition-transform peer-checked:after:translate-x-5"
            />
            In stock only
          </label>

          <div className="flex h-11 items-center gap-3 lg:ml-auto">
            <p className="text-sm text-muted">
              {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </p>
            <Button variant="ghost" onClick={onClear}>
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
