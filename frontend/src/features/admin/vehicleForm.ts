import type { Category } from '../../shared/lib/categories';
import type { Vehicle } from '../vehicles';
import type { NewVehicle, VehicleChanges } from './adminApi';

// These limits mirror the backend's validation, so most mistakes are caught before a request.
const MAX_INT = 2147483647;
const MAX_NAME_LENGTH = 60;
const MAX_PRICE_DOLLARS = Math.floor(MAX_INT / 100);
const WHOLE_NUMBER = /^\d+$/;

/** Form fields hold what was typed; price is in whole dollars. */
export type VehicleFormValues = {
  make: string;
  model: string;
  category: Category;
  price: string;
  quantity: string;
  imageUrl: string;
};

export type VehicleFormErrors = Partial<Record<keyof VehicleFormValues, string>>;

export const emptyValues: VehicleFormValues = {
  make: '',
  model: '',
  category: 'SEDAN',
  price: '',
  quantity: '1',
  imageUrl: '',
};

export function valuesFrom(vehicle: Vehicle): VehicleFormValues {
  return {
    make: vehicle.make,
    model: vehicle.model,
    category: vehicle.category,
    price: String(vehicle.price / 100),
    quantity: String(vehicle.quantity),
    imageUrl: vehicle.imageUrl ?? '',
  };
}

export function isWholeNumberBetween(value: string, min: number, max: number): boolean {
  if (!WHOLE_NUMBER.test(value.trim())) return false;
  const number = Number(value);
  return number >= min && number <= max;
}

function nameError(value: string, field: string): string | undefined {
  const length = value.trim().length;
  if (length === 0) return `Enter the ${field}`;
  if (length > MAX_NAME_LENGTH) return `Keep the ${field} to ${MAX_NAME_LENGTH} characters`;
}

function isUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function validateVehicleForm(
  values: VehicleFormValues,
  { withQuantity }: { withQuantity: boolean },
): VehicleFormErrors {
  const errors: VehicleFormErrors = {};
  const make = nameError(values.make, 'make');
  if (make) errors.make = make;
  const model = nameError(values.model, 'model');
  if (model) errors.model = model;
  if (!isWholeNumberBetween(values.price, 1, MAX_PRICE_DOLLARS)) {
    errors.price = 'Enter whole dollars, at least $1';
  }
  if (withQuantity && !isWholeNumberBetween(values.quantity, 0, MAX_INT)) {
    errors.quantity = 'Enter a whole number, 0 or more';
  }
  const imageUrl = values.imageUrl.trim();
  if (imageUrl && !isUrl(imageUrl)) errors.imageUrl = 'Enter a full URL, such as https://…';
  return errors;
}

function dollarsToCents(dollars: string): number {
  return Number(dollars) * 100;
}

export function toNewVehicle(values: VehicleFormValues): NewVehicle {
  const imageUrl = values.imageUrl.trim();
  return {
    make: values.make.trim(),
    model: values.model.trim(),
    category: values.category,
    price: dollarsToCents(values.price),
    quantity: Number(values.quantity),
    ...(imageUrl ? { imageUrl } : {}),
  };
}

/** Only what the admin changed, so an edit never overwrites someone else's change to another field. */
export function changedFields(vehicle: Vehicle, values: VehicleFormValues): VehicleChanges {
  const changes: VehicleChanges = {};
  const make = values.make.trim();
  if (make !== vehicle.make) changes.make = make;
  const model = values.model.trim();
  if (model !== vehicle.model) changes.model = model;
  if (values.category !== vehicle.category) changes.category = values.category;
  const price = dollarsToCents(values.price);
  if (price !== vehicle.price) changes.price = price;
  // The API can set an image URL but not clear one, so an emptied field is left alone.
  const imageUrl = values.imageUrl.trim();
  if (imageUrl && imageUrl !== vehicle.imageUrl) changes.imageUrl = imageUrl;
  return changes;
}
