export type Category = 'SEDAN' | 'SUV' | 'HATCHBACK' | 'COUPE' | 'CONVERTIBLE' | 'PICKUP' | 'VAN';

/** The backend's Category enum, in display order. */
export const categories: Category[] = [
  'SEDAN',
  'SUV',
  'HATCHBACK',
  'COUPE',
  'CONVERTIBLE',
  'PICKUP',
  'VAN',
];

export const bodyStyleNames: Record<Category, string> = {
  SEDAN: 'Sedan',
  SUV: 'SUV',
  HATCHBACK: 'Hatchback',
  COUPE: 'Coupe',
  CONVERTIBLE: 'Convertible',
  PICKUP: 'Pickup',
  VAN: 'Van',
};
