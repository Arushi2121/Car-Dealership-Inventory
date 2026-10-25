import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { listVehicles, searchVehicles } from './api';
import { hasServerFilters, toApiQuery, type Filters, type Sort } from './filters';
import type { Vehicle } from './types';

type ServerFilters = Pick<Filters, 'q' | 'category' | 'minPrice' | 'maxPrice'>;

/** The API has one text filter per field, so q tries make first and falls back to model. */
async function fetchVehicles(filters: ServerFilters): Promise<Vehicle[]> {
  const asFilters: Filters = { ...filters, inStock: false, sort: 'recommended' };
  if (!hasServerFilters(asFilters)) return listVehicles();

  const query = toApiQuery(asFilters);
  const byMake = await searchVehicles(query);
  const make = query.get('make');
  if (byMake.length > 0 || !make) return byMake;

  query.delete('make');
  query.set('model', make);
  return searchVehicles(query);
}

function sortVehicles(vehicles: Vehicle[], sort: Sort): Vehicle[] {
  const sorted = [...vehicles];
  if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  if (sort === 'name') {
    sorted.sort((a, b) => `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`));
  }
  return sorted;
}

export function useVehicles(filters: Filters) {
  const { q, category, minPrice, maxPrice, inStock, sort } = filters;
  const serverFilters: ServerFilters = { q, category, minPrice, maxPrice };
  const query = useQuery({
    queryKey: ['vehicles', serverFilters],
    queryFn: () => fetchVehicles(serverFilters),
  });

  const vehicles = useMemo(() => {
    const loaded = query.data ?? [];
    return sortVehicles(inStock ? loaded.filter((v) => v.quantity > 0) : loaded, sort);
  }, [query.data, inStock, sort]);

  return { ...query, vehicles };
}
