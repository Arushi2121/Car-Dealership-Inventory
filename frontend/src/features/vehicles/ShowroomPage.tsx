import type { ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { bodyStyleNames, categories, type Category } from '../../shared/lib/categories';
import { Button } from '../../shared/ui';
import { useDealRatings } from '../deals';
import { FilterBar } from './FilterBar';
import { readFilters, writeFilters, type Filters } from './filters';
import { useVehicles } from './useVehicles';
import { VehicleCard } from './VehicleCard';
import { VehicleDetailPanel } from './VehicleDetailPanel';
import type { Vehicle } from './types';

const SKELETON_CARDS = 8;

const gridClasses = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

type ShowroomPageProps = {
  /** Shown beside the page title. */
  headerActions?: ReactNode;
  /** Extra controls for one car, shown in its card above Purchase. */
  renderCardActions?: (vehicle: Vehicle) => ReactNode;
};

export function ShowroomPage({ headerActions, renderCardActions }: ShowroomPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const carId = searchParams.get('car');
  const { data, vehicles, isPending, isError, refetch } = useVehicles(filters);
  const ratings = useDealRatings();

  // Each change is a new history entry, so Back and Forward step through filters.
  function updateFilters(changes: Partial<Filters>) {
    setSearchParams((current) => {
      const next = writeFilters({ ...readFilters(current), ...changes });
      const car = current.get('car');
      if (car) next.set('car', car);
      return next;
    });
  }

  function clearFilters() {
    setSearchParams(carId ? { car: carId } : {});
  }

  function setCar(id: string | null) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (id) next.set('car', id);
      else next.delete('car');
      return next;
    });
  }

  const selected = data?.find((vehicle) => vehicle.id === carId);
  const bodyStyleCount = new Set(vehicles.map((vehicle) => vehicle.category)).size;
  const greatDeals = vehicles.filter((v) => ratings.get(v.id)?.rating === 'GREAT').length;

  const pills: { value: Category | ''; label: string }[] = [
    { value: '', label: 'All' },
    ...categories.map((category) => ({ value: category, label: bodyStyleNames[category] })),
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 pb-24">
      <div className="space-y-4 pt-12 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-4xl md:text-5xl">The showroom</h1>
          {headerActions}
        </div>
        {!isPending && !isError && (
          <p className="text-muted">
            {plural(vehicles.length, 'car')} · {plural(bodyStyleCount, 'body style')} ·{' '}
            {plural(greatDeals, 'great deal')}
          </p>
        )}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {pills.map((pill) => {
            const active = filters.category === pill.value;
            return (
              <button
                key={pill.label}
                type="button"
                aria-pressed={active}
                onClick={() => updateFilters({ category: pill.value })}
                className={`shrink-0 rounded-pill border px-4 py-2 text-sm font-medium transition-colors ${active ? 'border-ink bg-ink text-surface' : 'border-line bg-surface text-ink hover:border-ink/30'}`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      <FilterBar
        filters={filters}
        resultCount={vehicles.length}
        onChange={updateFilters}
        onClear={clearFilters}
      />

      <div className="mt-6">
        {isPending ? (
          <div aria-busy="true" className={gridClasses}>
            {Array.from({ length: SKELETON_CARDS }, (_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-card border border-line bg-surface"
              >
                <div className="aspect-16/10 animate-pulse bg-raised" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded-pill bg-raised" />
                  <div className="h-5 w-2/3 animate-pulse rounded-pill bg-raised" />
                  <div className="h-6 w-1/2 animate-pulse rounded-pill bg-raised" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div role="alert" className="grid justify-items-center gap-4 py-24 text-center">
            <p className="text-lg">We couldn't load the cars.</p>
            <Button variant="dark" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="grid justify-items-center gap-4 py-24 text-center">
            <p className="font-display text-2xl font-semibold">No cars match your filters</p>
            <Button variant="dark" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className={gridClasses}>
            {vehicles.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                deal={ratings.get(vehicle.id)}
                index={index}
                onViewDetails={setCar}
                actions={renderCardActions?.(vehicle)}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <VehicleDetailPanel
          vehicle={selected}
          deal={ratings.get(selected.id)}
          onClose={() => setCar(null)}
        />
      )}
    </main>
  );
}
