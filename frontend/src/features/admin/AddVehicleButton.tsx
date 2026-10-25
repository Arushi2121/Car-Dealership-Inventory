import { useState } from 'react';
import { Button } from '../../shared/ui';
import { VehicleFormDialog } from './VehicleFormDialog';

export function AddVehicleButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <span aria-hidden="true">+</span>
        Add vehicle
      </Button>
      {open && <VehicleFormDialog mode="add" onClose={() => setOpen(false)} />}
    </>
  );
}
