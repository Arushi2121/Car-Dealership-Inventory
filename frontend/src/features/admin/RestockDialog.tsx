import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Dialog, Input } from '../../shared/ui';
import type { Vehicle } from '../vehicles';
import { FormError } from './FormError';
import { isGone, useAdminMutations } from './useAdminMutations';
import { isWholeNumberBetween } from './vehicleForm';

const MAX_RESTOCK = 10000;

export function RestockDialog({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const [quantity, setQuantity] = useState('1');
  const [error, setError] = useState<string>();
  const { restock } = useAdminMutations();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isWholeNumberBetween(quantity, 1, MAX_RESTOCK)) {
      setError('Enter a whole number from 1 to 10,000');
      return;
    }
    restock.mutate(
      { id: vehicle.id, quantity: Number(quantity) },
      {
        onSuccess: onClose,
        onError: (failure) => {
          if (isGone(failure)) onClose();
        },
      },
    );
  }

  return (
    <Dialog title={`Restock ${vehicle.make} ${vehicle.model}`} onClose={onClose}>
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <FormError error={restock.error} />
        <p className="text-muted">{vehicle.quantity} in stock now.</p>
        <Input
          label="Quantity"
          inputMode="numeric"
          value={quantity}
          onChange={(event) => {
            setQuantity(event.target.value);
            setError(undefined);
          }}
          error={error}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="dark" loading={restock.isPending}>
            Restock
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
