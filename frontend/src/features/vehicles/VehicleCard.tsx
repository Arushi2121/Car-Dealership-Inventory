import { useId } from 'react';
import { formatPrice } from '../../shared/lib/format';
import { Button, Card, CarImage } from '../../shared/ui';
import { DealBadge, type DealRating } from '../deals';
import { DEFAULT_TERMS, monthlyPayment } from '../finance';
import { PurchaseButton } from './PurchaseButton';
import type { Vehicle } from './types';

const LOW_STOCK = 3;
const STAGGER_MS = 30;
const MAX_STAGGERED = 12;

type VehicleCardProps = {
  vehicle: Vehicle;
  deal: DealRating | undefined;
  index: number;
  onViewDetails: (id: string) => void;
};

function StockLabel({ quantity }: { quantity: number }) {
  const chip = 'absolute right-4 top-4 rounded-pill px-2.5 py-1 text-xs font-semibold';
  if (quantity === 0) return <span className={`${chip} bg-surface text-muted`}>Out of stock</span>;
  if (quantity <= LOW_STOCK) {
    return <span className={`${chip} bg-accent text-accent-fg`}>Only {quantity} left</span>;
  }
  return null;
}

export function VehicleCard({ vehicle, deal, index, onViewDetails }: VehicleCardProps) {
  const makeId = useId();
  const modelId = useId();
  const { make, model, category, price, quantity, imageUrl } = vehicle;
  const fromMonthly = monthlyPayment({ price, ...DEFAULT_TERMS });

  return (
    <Card
      role="article"
      aria-labelledby={`${makeId} ${modelId}`}
      style={{ animationDelay: `${Math.min(index, MAX_STAGGERED) * STAGGER_MS}ms` }}
      className="group flex flex-col transition duration-200 hover:border-ink/30 motion-safe:animate-rise-in motion-safe:hover:-translate-y-0.5"
    >
      <div className="relative overflow-hidden">
        <CarImage
          make={make}
          model={model}
          category={category}
          imageUrl={imageUrl ?? undefined}
          className={`aspect-16/10 w-full transition-transform duration-300 motion-safe:group-hover:scale-105 ${quantity === 0 ? 'opacity-60' : ''}`}
        />
        <div className="absolute left-4 top-4">
          <DealBadge rating={deal?.rating} />
        </div>
        <StockLabel quantity={quantity} />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p id={makeId} className="text-xs font-medium uppercase tracking-wide text-muted">
            {make}
          </p>
          <h3 id={modelId} className="text-xl">
            {model}
          </h3>
        </div>
        <div>
          <p className="font-display text-2xl font-semibold">{formatPrice(price)}</p>
          <p className="text-sm text-muted">from {formatPrice(fromMonthly)}/mo</p>
        </div>
        <div className="mt-auto grid gap-2">
          <Button variant="ghost" onClick={() => onViewDetails(vehicle.id)}>
            View details
            <span className="sr-only">
              {' '}
              for {make} {model}
            </span>
          </Button>
          <PurchaseButton vehicle={vehicle} className="w-full" />
        </div>
      </div>
    </Card>
  );
}
