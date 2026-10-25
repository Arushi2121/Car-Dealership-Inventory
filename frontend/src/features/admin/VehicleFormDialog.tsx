import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { bodyStyleNames, categories, type Category } from '../../shared/lib/categories';
import { Button, Dialog, Input } from '../../shared/ui';
import type { Vehicle } from '../vehicles';
import { FormError } from './FormError';
import { isGone, useAdminMutations } from './useAdminMutations';
import {
  changedFields,
  emptyValues,
  toNewVehicle,
  validateVehicleForm,
  valuesFrom,
  type VehicleFormErrors,
  type VehicleFormValues,
} from './vehicleForm';

type VehicleFormDialogProps =
  | { mode: 'add'; onClose: () => void }
  | { mode: 'edit'; vehicle: Vehicle; onClose: () => void };

export function VehicleFormDialog(props: VehicleFormDialogProps) {
  const { mode, onClose } = props;
  const editing = mode === 'edit' ? props.vehicle : null;
  const [values, setValues] = useState<VehicleFormValues>(() =>
    editing ? valuesFrom(editing) : emptyValues,
  );
  const [errors, setErrors] = useState<VehicleFormErrors>({});
  const categoryId = useId();
  const { create, update } = useAdminMutations();
  const mutation = editing ? update : create;

  function setField<K extends keyof VehicleFormValues>(field: K, value: VehicleFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const found = validateVehicleForm(values, { withQuantity: !editing });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const callbacks = {
      onSuccess: onClose,
      onError: (error: Error) => {
        if (isGone(error)) onClose();
      },
    };
    if (!editing) {
      create.mutate(toNewVehicle(values), callbacks);
      return;
    }
    const changes = changedFields(editing, values);
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }
    update.mutate({ id: editing.id, changes }, callbacks);
  }

  const title = editing ? `Edit ${editing.make} ${editing.model}` : 'Add vehicle';

  return (
    <Dialog title={title} onClose={onClose}>
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <FormError error={mutation.error} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Make"
            value={values.make}
            onChange={(event) => setField('make', event.target.value)}
            error={errors.make}
          />
          <Input
            label="Model"
            value={values.model}
            onChange={(event) => setField('model', event.target.value)}
            error={errors.model}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={categoryId} className="block text-sm font-medium text-ink">
            Body style
          </label>
          <select
            id={categoryId}
            value={values.category}
            onChange={(event) => setField('category', event.target.value as Category)}
            className="h-11 w-full rounded-xl border border-line bg-surface px-4 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {bodyStyleNames[category]}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Price (USD)"
            inputMode="numeric"
            value={values.price}
            onChange={(event) => setField('price', event.target.value)}
            error={errors.price}
          />
          {!editing && (
            <Input
              label="Quantity"
              inputMode="numeric"
              value={values.quantity}
              onChange={(event) => setField('quantity', event.target.value)}
              error={errors.quantity}
            />
          )}
        </div>
        <Input
          label="Image URL (optional)"
          type="url"
          value={values.imageUrl}
          onChange={(event) => setField('imageUrl', event.target.value)}
          error={errors.imageUrl}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="dark" loading={mutation.isPending}>
            {editing ? 'Save changes' : 'Add vehicle'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
