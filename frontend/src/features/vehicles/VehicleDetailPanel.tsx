import { useEffect, useId, useRef } from 'react';
import { bodyStyleNames } from '../../shared/lib/categories';
import { formatPrice } from '../../shared/lib/format';
import { Button, CarImage } from '../../shared/ui';
import { DealBadge, dealExplanation, type DealRating } from '../deals';
import { EmiCalculator } from '../finance';
import { PurchaseButton } from './PurchaseButton';
import type { Vehicle } from './types';

type VehicleDetailPanelProps = {
  vehicle: Vehicle;
  deal: DealRating | undefined;
  onClose: () => void;
};

export function VehicleDetailPanel({ vehicle, deal, onClose }: VehicleDetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { make, model, category, price, quantity, imageUrl } = vehicle;
  const bodyStyle = bodyStyleNames[category];

  // Focus moves in on open and back to whatever opened the panel on close.
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => trigger?.focus();
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 motion-safe:animate-fade-in"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative h-full w-full overflow-y-auto bg-surface outline-none motion-safe:animate-slide-in md:max-w-xl"
      >
        <div className="relative">
          <CarImage
            make={make}
            model={model}
            category={category}
            imageUrl={imageUrl ?? undefined}
            className="aspect-16/10 w-full"
          />
          <Button
            variant="ghost"
            onClick={onClose}
            className="absolute right-4 top-4 bg-surface"
            aria-label="Close details"
          >
            Close
          </Button>
        </div>

        <div className="space-y-8 p-6 md:p-8">
          <div className="space-y-2">
            <h2 id={titleId} className="text-3xl md:text-4xl">
              {make} {model}
            </h2>
            <p className="font-display text-3xl font-semibold">{formatPrice(price)}</p>
          </div>

          <div className="space-y-2">
            <DealBadge rating={deal?.rating} />
            <p className="text-muted">{dealExplanation(deal, bodyStyle)}</p>
          </div>

          <dl className="grid grid-cols-3 gap-4 border-y border-line py-5 text-sm">
            <div>
              <dt className="text-muted">Body style</dt>
              <dd className="mt-1 font-medium">{bodyStyle}</dd>
            </div>
            <div>
              <dt className="text-muted">Stock</dt>
              <dd className="mt-1 font-medium">
                {quantity === 0 ? 'Out of stock' : `${quantity} available`}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Price</dt>
              <dd className="mt-1 font-medium">{formatPrice(price)}</dd>
            </div>
          </dl>

          <EmiCalculator price={price} />

          <PurchaseButton vehicle={vehicle} className="w-full" />
        </div>
      </div>
    </div>
  );
}
