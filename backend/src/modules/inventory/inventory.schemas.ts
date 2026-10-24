import { z } from 'zod';

// The largest value a Postgres Int column holds.
const MAX_INT = 2147483647;

// prefault, not default: Zod 4's default returns {} as-is, skipping the inner quantity default.
// Express 5 leaves req.body undefined when a request has no body.
export const purchaseSchema = z
  .object({ quantity: z.number().int().min(1).max(MAX_INT).default(1) })
  .prefault({});

export const restockSchema = z.object({
  quantity: z.number().int().min(1).max(10000),
});

export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type RestockInput = z.infer<typeof restockSchema>;
