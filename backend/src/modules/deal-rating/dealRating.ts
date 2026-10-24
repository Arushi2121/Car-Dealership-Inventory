const GREAT_THRESHOLD = 0.9;
const ABOVE_MARKET_THRESHOLD = 1.1;
const MIN_COMPARABLES = 3;

type RatedVehicle = {
  id: string;
  category: string;
  price: number;
};

export type DealRatingLabel = 'GREAT' | 'FAIR' | 'ABOVE_MARKET';

export type DealRating = {
  vehicleId: string;
  rating: DealRatingLabel | null;
  categoryMedian: number | null;
  differencePercent: number | null;
};

/** Math.round(-6.5) is -6; a car 6.5% under the median should show -7, the mirror of +7. */
function roundHalfAwayFromZero(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value));
}

function labelFor(price: number, exactMedian: number): DealRatingLabel {
  const ratio = price / exactMedian;
  if (ratio <= GREAT_THRESHOLD) return 'GREAT';
  if (ratio >= ABOVE_MARKET_THRESHOLD) return 'ABOVE_MARKET';
  return 'FAIR';
}

/** Middle value, or the mean of the two middle values. The input array is left unchanged. */
export function median(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Compares each vehicle with the median price of its own category, counting itself.
 * Fewer than three vehicles in a category is too small a market, so those ratings are null.
 */
export function rateDeals(vehicles: RatedVehicle[]): DealRating[] {
  const pricesByCategory = new Map<string, number[]>();
  for (const vehicle of vehicles) {
    const prices = pricesByCategory.get(vehicle.category);
    if (prices) prices.push(vehicle.price);
    else pricesByCategory.set(vehicle.category, [vehicle.price]);
  }

  const medianByCategory = new Map<string, number>();
  for (const [category, prices] of pricesByCategory) {
    if (prices.length >= MIN_COMPARABLES) medianByCategory.set(category, median(prices));
  }

  return vehicles.map((vehicle) => {
    const exactMedian = medianByCategory.get(vehicle.category);
    if (exactMedian === undefined) {
      return {
        vehicleId: vehicle.id,
        rating: null,
        categoryMedian: null,
        differencePercent: null,
      };
    }

    return {
      vehicleId: vehicle.id,
      rating: labelFor(vehicle.price, exactMedian),
      categoryMedian: Math.round(exactMedian),
      differencePercent: roundHalfAwayFromZero(((vehicle.price - exactMedian) / exactMedian) * 100),
    };
  });
}
