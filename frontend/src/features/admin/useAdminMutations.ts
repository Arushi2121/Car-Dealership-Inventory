import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '../../shared/lib/api';
import { useToast } from '../../shared/ui';
import type { Vehicle } from '../vehicles';
import {
  createVehicle,
  deleteVehicle,
  restockVehicle,
  updateVehicle,
  type NewVehicle,
  type VehicleChanges,
} from './adminApi';

/** A 404 means another admin removed the car while this one was looking at it. */
export function isGone(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

function replaceIn(updated: Vehicle) {
  return (list: Vehicle[]) => list.map((item) => (item.id === updated.id ? updated : item));
}

export function useAdminMutations() {
  const queryClient = useQueryClient();
  const showToast = useToast();

  // The cache edit shows the change at once; the refetch fixes any list whose filters it no longer matches.
  function applyToLists(change: (list: Vehicle[]) => Vehicle[]) {
    queryClient.setQueriesData<Vehicle[]>({ queryKey: ['vehicles'] }, (list) => list && change(list));
    void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    void queryClient.invalidateQueries({ queryKey: ['deal-ratings'] });
  }

  function onError(error: Error) {
    if (!isGone(error)) return;
    showToast('This car was already removed');
    void queryClient.invalidateQueries({ queryKey: ['vehicles'] });
  }

  const create = useMutation({
    mutationFn: (vehicle: NewVehicle) => createVehicle(vehicle),
    onSuccess: (created) => {
      showToast('Vehicle added');
      applyToLists((list) => [...list, created]);
    },
    onError,
  });

  const update = useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: VehicleChanges }) =>
      updateVehicle(id, changes),
    onSuccess: (updated) => {
      showToast('Vehicle updated');
      applyToLists(replaceIn(updated));
    },
    onError,
  });

  const restock = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      restockVehicle(id, quantity),
    onSuccess: (updated) => {
      showToast(`${updated.make} ${updated.model} restocked · ${updated.quantity} in stock`);
      applyToLists(replaceIn(updated));
    },
    onError,
  });

  const remove = useMutation({
    mutationFn: (vehicle: Vehicle) => deleteVehicle(vehicle.id),
    onSuccess: (_, vehicle) => {
      showToast(`${vehicle.make} ${vehicle.model} deleted`);
      applyToLists((list) => list.filter((item) => item.id !== vehicle.id));
    },
    onError,
  });

  return { create, update, restock, remove };
}
