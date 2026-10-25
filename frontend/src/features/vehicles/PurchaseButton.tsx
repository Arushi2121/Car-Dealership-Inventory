import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ApiError } from '../../shared/lib/api';
import { formatPrice } from '../../shared/lib/format';
import { Button, useToast } from '../../shared/ui';
import { purchaseVehicle } from './api';
import type { Vehicle } from './types';

const CONFIRM_MS = 4000;

/** Two clicks to buy: the first asks for confirmation, which lapses after 4 seconds. */
export function PurchaseButton({
  vehicle,
  className = '',
}: {
  vehicle: Vehicle;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const queryClient = useQueryClient();
  const showToast = useToast();

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [confirming]);

  const purchase = useMutation({
    mutationFn: () => purchaseVehicle(vehicle.id, 1),
    onSuccess: (updated) => {
      // Every cached list (any filter) holding this car shows the new stock at once.
      queryClient.setQueriesData<Vehicle[]>({ queryKey: ['vehicles'] }, (list) =>
        list?.map((item) => (item.id === updated.id ? updated : item)),
      );
      void queryClient.invalidateQueries({ queryKey: ['deal-ratings'] });
      showToast(`${updated.make} ${updated.model} purchased · ${updated.quantity} left`);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        showToast('Someone just bought the last one');
        void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      } else {
        showToast(error instanceof ApiError ? error.message : 'Purchase failed');
      }
    },
    onSettled: () => setConfirming(false),
  });

  if (vehicle.quantity === 0) {
    return (
      <Button disabled className={className}>
        Out of stock
      </Button>
    );
  }

  return (
    <Button
      loading={purchase.isPending}
      onClick={() => (confirming ? purchase.mutate() : setConfirming(true))}
      className={className}
    >
      {confirming ? `Confirm · ${formatPrice(vehicle.price)}` : 'Purchase'}
    </Button>
  );
}
