import { apiFetch } from '../../shared/lib/api';
import type { Vehicle } from '../vehicles';

export type NewVehicle = Pick<Vehicle, 'make' | 'model' | 'category' | 'price' | 'quantity'> & {
  imageUrl?: string;
};

/** Quantity is absent on purpose: stock changes only through purchase and restock. */
export type VehicleChanges = Partial<Pick<Vehicle, 'make' | 'model' | 'category' | 'price'>> & {
  imageUrl?: string;
};

export function createVehicle(vehicle: NewVehicle): Promise<Vehicle> {
  return apiFetch<Vehicle>('/api/vehicles', { method: 'POST', body: vehicle });
}

export function updateVehicle(id: string, changes: VehicleChanges): Promise<Vehicle> {
  return apiFetch<Vehicle>(`/api/vehicles/${id}`, { method: 'PUT', body: changes });
}

export function deleteVehicle(id: string): Promise<void> {
  return apiFetch<void>(`/api/vehicles/${id}`, { method: 'DELETE' });
}

export function restockVehicle(id: string, quantity: number): Promise<Vehicle> {
  return apiFetch<Vehicle>(`/api/vehicles/${id}/restock`, {
    method: 'POST',
    body: { quantity },
  });
}
