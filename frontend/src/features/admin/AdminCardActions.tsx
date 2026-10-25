import { useState } from 'react';
import { Button } from '../../shared/ui';
import type { Vehicle } from '../vehicles';
import { DeleteVehicleDialog } from './DeleteVehicleDialog';
import { RestockDialog } from './RestockDialog';
import { VehicleFormDialog } from './VehicleFormDialog';

type OpenDialog = 'edit' | 'restock' | 'delete' | null;

/** Edit, Restock and Delete for one car. Each button's name includes the car for screen readers. */
export function AdminCardActions({ vehicle }: { vehicle: Vehicle }) {
  const [open, setOpen] = useState<OpenDialog>(null);
  const close = () => setOpen(null);
  const car = <span className="sr-only">{`${vehicle.make} ${vehicle.model}`}</span>;

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <Button variant="ghost" size="sm" onClick={() => setOpen('edit')}>
          Edit {car}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen('restock')}>
          Restock {car}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpen('delete')}>
          Delete {car}
        </Button>
      </div>
      {open === 'edit' && <VehicleFormDialog mode="edit" vehicle={vehicle} onClose={close} />}
      {open === 'restock' && <RestockDialog vehicle={vehicle} onClose={close} />}
      {open === 'delete' && <DeleteVehicleDialog vehicle={vehicle} onClose={close} />}
    </>
  );
}
