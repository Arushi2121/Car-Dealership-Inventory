import { Button, Dialog } from '../../shared/ui';
import type { Vehicle } from '../vehicles';
import { FormError } from './FormError';
import { isGone, useAdminMutations } from './useAdminMutations';

export function DeleteVehicleDialog({
  vehicle,
  onClose,
}: {
  vehicle: Vehicle;
  onClose: () => void;
}) {
  const { remove } = useAdminMutations();

  function confirmDelete() {
    remove.mutate(vehicle, {
      onSuccess: onClose,
      onError: (error) => {
        if (isGone(error)) onClose();
      },
    });
  }

  return (
    <Dialog title={`Delete ${vehicle.make} ${vehicle.model}?`} onClose={onClose}>
      <FormError error={remove.error} />
      <p className="text-muted">This removes it from the showroom. This cannot be undone.</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" loading={remove.isPending} onClick={confirmDelete}>
          Delete
        </Button>
      </div>
    </Dialog>
  );
}
