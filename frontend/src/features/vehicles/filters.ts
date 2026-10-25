import { categories, type Category } from '../../shared/lib/categories';

export type Sort = 'recommended' | 'price-asc' | 'price-desc' | 'name';

/** Filters as the user sees them. Prices are whole dollars; the API takes cents. */
export type Filters = {
  q: string;
  category: Category | '';
  minPrice: number | null;
  maxPrice: number | null;
  inStock: boolean;
  sort: Sort;
};

export const sortOptions: { value: Sort; label: string }[] = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name' },
];

function readPrice(value: string | null): number | null {
  if (!value) return null;
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

/** Unknown or malformed params fall back to "no filter", so a hand-edited URL never breaks the page. */
export function readFilters(params: URLSearchParams): Filters {
  const category = params.get('category') ?? '';
  const sort = params.get('sort') ?? '';
  return {
    // Not trimmed here: the search box mirrors this value, and trimming would eat a typed space.
    q: params.get('q') ?? '',
    category: categories.includes(category as Category) ? (category as Category) : '',
    minPrice: readPrice(params.get('minPrice')),
    maxPrice: readPrice(params.get('maxPrice')),
    inStock: params.get('inStock') === '1',
    sort: sortOptions.some((option) => option.value === sort) ? (sort as Sort) : 'recommended',
  };
}

/** The URL form of the filters, leaving out anything at its default. */
export function writeFilters(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);
  if (filters.minPrice !== null) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== null) params.set('maxPrice', String(filters.maxPrice));
  if (filters.inStock) params.set('inStock', '1');
  if (filters.sort !== 'recommended') params.set('sort', filters.sort);
  return params;
}

/** The search endpoint's query: q is sent as make, and dollars become cents. */
export function toApiQuery(filters: Filters): URLSearchParams {
  const query = new URLSearchParams();
  const q = filters.q.trim();
  if (q) query.set('make', q);
  if (filters.category) query.set('category', filters.category);
  if (filters.minPrice !== null) query.set('minPrice', String(filters.minPrice * 100));
  if (filters.maxPrice !== null) query.set('maxPrice', String(filters.maxPrice * 100));
  return query;
}

/** In-stock and sort are applied in the browser, so only these need the search endpoint. */
export function hasServerFilters(filters: Filters): boolean {
  return Boolean(
    filters.q.trim() || filters.category || filters.minPrice !== null || filters.maxPrice !== null,
  );
}
