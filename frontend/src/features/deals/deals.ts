import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../shared/lib/api';
import { formatPrice } from '../../shared/lib/format';

export type Rating = 'GREAT' | 'FAIR' | 'ABOVE_MARKET';

export type DealRating = {
  vehicleId: string;
  rating: Rating | null;
  categoryMedian: number | null;
  differencePercent: number | null;
};

const labels: Record<Rating, string> = {
  GREAT: 'Great price',
  FAIR: 'Fair price',
  ABOVE_MARKET: 'Above market',
};

export function dealLabel(rating: Rating | null): string | null {
  return rating ? labels[rating] : null;
}

/** One sentence on how the price compares, e.g. "20% below the Sedan median of $25,000". */
export function dealExplanation(deal: DealRating | undefined, bodyStyle: string): string {
  if (!deal?.rating || deal.categoryMedian === null || deal.differencePercent === null) {
    return 'Not enough similar cars to rate this price yet.';
  }
  const median = `the ${bodyStyle} median of ${formatPrice(deal.categoryMedian)}`;
  const difference = Math.abs(deal.differencePercent);
  if (deal.rating === 'GREAT') return `${difference}% below ${median}`;
  if (deal.rating === 'ABOVE_MARKET') return `${difference}% above ${median}`;
  return `Within 10% of ${median}`;
}

const noRatings = new Map<string, DealRating>();

function byVehicleId(ratings: DealRating[]): Map<string, DealRating> {
  return new Map(ratings.map((rating) => [rating.vehicleId, rating]));
}

/** Ratings are a nice-to-have: while loading or on error, cars simply show no badge. */
export function useDealRatings(): Map<string, DealRating> {
  const { data } = useQuery({
    queryKey: ['deal-ratings'],
    queryFn: () => apiFetch<DealRating[]>('/api/deal-ratings'),
    select: byVehicleId,
  });
  return data ?? noRatings;
}
