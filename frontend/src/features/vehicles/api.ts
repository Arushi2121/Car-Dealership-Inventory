import { apiFetch } from '../../shared/lib/api';
import type { Vehicle } from './types';

export function listVehicles(): Promise<Vehicle[]> {
  return apiFetch<Vehicle[]>('/api/vehicles');
}

export function searchVehicles(query: URLSearchParams): Promise<Vehicle[]> {
  return apiFetch<Vehicle[]>(`/api/vehicles/search?${query}`);
}

export function purchaseVehicle(id: string, quantity: number): Promise<Vehicle> {
  return apiFetch<Vehicle>(`/api/vehicles/${id}/purchase`, {
    method: 'POST',
    body: { quantity },
  });
}
