import type { Category } from '@prisma/client';

type DemoVehicle = {
  make: string;
  model: string;
  category: Category;
  price: number;
  quantity: number;
};

/**
 * SAMPLE DATA. Plausible showroom stock with invented prices, not live market quotes.
 * Inserted only when the vehicle table is empty.
 */
export const demoVehicles: DemoVehicle[] = [
  { make: 'Honda', model: 'Civic', category: 'SEDAN', price: 2245000, quantity: 6 },
  { make: 'Toyota', model: 'Camry', category: 'SEDAN', price: 2799000, quantity: 4 },
  { make: 'BMW', model: '330i', category: 'SEDAN', price: 4560000, quantity: 2 },
  { make: 'Hyundai', model: 'Tucson', category: 'SUV', price: 2735000, quantity: 3 },
  { make: 'Honda', model: 'CR-V', category: 'SUV', price: 3245000, quantity: 5 },
  { make: 'Toyota', model: 'Highlander', category: 'SUV', price: 4285000, quantity: 2 },
  {
    make: 'Toyota',
    model: 'Corolla Hatchback',
    category: 'HATCHBACK',
    price: 2315000,
    quantity: 7,
  },
  { make: 'Volkswagen', model: 'Golf', category: 'HATCHBACK', price: 2699000, quantity: 4 },
  { make: 'Mazda', model: 'Mazda3', category: 'HATCHBACK', price: 3145000, quantity: 3 },
  { make: 'Chevrolet', model: 'Camaro', category: 'COUPE', price: 3420000, quantity: 0 },
  { make: 'Ford', model: 'Mustang', category: 'COUPE', price: 3850000, quantity: 2 },
  { make: 'Mazda', model: 'MX-5', category: 'CONVERTIBLE', price: 3175000, quantity: 4 },
  { make: 'BMW', model: '430i Convertible', category: 'CONVERTIBLE', price: 5840000, quantity: 1 },
  { make: 'Toyota', model: 'Tacoma', category: 'PICKUP', price: 3680000, quantity: 0 },
  { make: 'Ford', model: 'F-150', category: 'PICKUP', price: 4620000, quantity: 8 },
  { make: 'Chrysler', model: 'Pacifica', category: 'VAN', price: 3990000, quantity: 1 },
  { make: 'Honda', model: 'Odyssey', category: 'VAN', price: 4015000, quantity: 3 },
  { make: 'Toyota', model: 'Sienna', category: 'VAN', price: 4325000, quantity: 2 },
];
