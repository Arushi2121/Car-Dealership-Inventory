import { Category } from '@prisma/client';
import { z } from 'zod';

// The largest value a Postgres Int column holds.
const MAX_INT = 2147483647;

const name = z.string().trim().min(1, 'must not be empty').max(60, 'must be at most 60 characters');
const category = z.enum(Category);
const price = z.number().int().min(1).max(MAX_INT);
const imageUrl = z.url();

export const createVehicleSchema = z.object({
  make: name,
  model: name,
  category,
  price,
  quantity: z.number().int().min(0).max(MAX_INT),
  imageUrl: imageUrl.optional(),
});

// Strict so a client sending quantity hears why, instead of having it silently dropped.
export const updateVehicleSchema = z
  .strictObject(
    {
      make: name.optional(),
      model: name.optional(),
      category: category.optional(),
      price: price.optional(),
      imageUrl: imageUrl.optional(),
    },
    {
      error: (issue) =>
        issue.code === 'unrecognized_keys' && issue.keys.includes('quantity')
          ? 'quantity cannot be changed here; use purchase or restock'
          : undefined,
    },
  )
  .refine((data) => Object.keys(data).length > 0, 'at least one field is required');

// An empty search form sends every field as "", which means "no filter", not "match empty".
const queryText = z
  .string()
  .trim()
  .transform((value) => value || undefined);
const queryPrice = queryText.pipe(z.coerce.number<string>().int().min(0).max(MAX_INT).optional());

export const searchVehicleSchema = z
  .object({
    make: queryText.optional(),
    model: queryText.optional(),
    category: queryText
      .transform((value) => value?.toUpperCase())
      .pipe(category.optional())
      .optional(),
    minPrice: queryPrice.optional(),
    maxPrice: queryPrice.optional(),
  })
  .refine(
    ({ minPrice, maxPrice }) =>
      minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice,
    { message: 'must not be greater than maxPrice', path: ['minPrice'] },
  );

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type SearchVehicleFilters = z.infer<typeof searchVehicleSchema>;
