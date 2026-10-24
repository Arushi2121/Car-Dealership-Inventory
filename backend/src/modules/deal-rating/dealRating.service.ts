import type { VehicleRepository } from '../vehicles/index.js';
import { rateDeals, type DealRating } from './dealRating.js';

/** Rates every vehicle in the catalogue. The read lives on the vehicles repository. */
export class DealRatingService {
  constructor(private readonly vehicleReader: Pick<VehicleRepository, 'findMany'>) {}

  async list(): Promise<DealRating[]> {
    const vehicles = await this.vehicleReader.findMany({});
    return rateDeals(vehicles);
  }
}
