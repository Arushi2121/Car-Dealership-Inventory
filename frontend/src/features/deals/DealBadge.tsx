import { Badge } from '../../shared/ui';
import { dealLabel, type Rating } from './deals';

const tones = { GREAT: 'great', FAIR: 'fair', ABOVE_MARKET: 'above' } as const;

export function DealBadge({ rating }: { rating: Rating | null | undefined }) {
  const label = dealLabel(rating ?? null);
  if (!rating || !label) return null;
  return <Badge tone={tones[rating]}>{label}</Badge>;
}
