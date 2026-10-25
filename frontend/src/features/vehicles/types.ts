import type { Category } from '../../shared/lib/categories';

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  category: Category;
  /** Cents, USD. */
  price: number;
  quantity: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
