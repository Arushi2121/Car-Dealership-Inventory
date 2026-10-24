import { Prisma, type PrismaClient, type Vehicle } from '@prisma/client';

/** Stock operations only, so the inventory module sees nothing else of the Vehicle table. */
export interface StockRepository {
  findById(id: string): Promise<Vehicle | null>;
  /** True only if the stock was at least n and has been lowered by n. */
  decrementIfAvailable(id: string, n: number): Promise<boolean>;
  /** Returns null when no vehicle has this id. */
  increment(id: string, n: number): Promise<Vehicle | null>;
}

export class PrismaStockRepository implements StockRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findById(id: string) {
    return this.prisma.vehicle.findUnique({ where: { id } });
  }

  async decrementIfAvailable(id: string, n: number) {
    // This single conditional update is what stops concurrent buyers taking stock below zero:
    // the check and the write happen in one statement, so no other purchase can slip between them.
    const { count } = await this.prisma.vehicle.updateMany({
      where: { id, quantity: { gte: n } },
      data: { quantity: { decrement: n } },
    });
    return count === 1;
  }

  async increment(id: string, n: number) {
    try {
      return await this.prisma.vehicle.update({
        where: { id },
        data: { quantity: { increment: n } },
      });
    } catch (err) {
      // P2025 is Prisma's "record to update does not exist".
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') return null;
      throw err;
    }
  }
}
