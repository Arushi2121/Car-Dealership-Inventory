import { hasServerFilters, readFilters, toApiQuery } from '../filters';

const noFilters = () => readFilters(new URLSearchParams());

describe('readFilters', () => {
  it('reads category, price, stock and sort from the URL', () => {
    const filters = readFilters(
      new URLSearchParams('?category=SUV&minPrice=20000&inStock=1&sort=price-asc'),
    );

    expect(filters).toMatchObject({
      category: 'SUV',
      minPrice: 20000,
      inStock: true,
      sort: 'price-asc',
    });
  });
});

describe('toApiQuery', () => {
  it('sends q as make, converts dollars to cents and omits empty fields', () => {
    const query = new URLSearchParams(
      toApiQuery({ ...noFilters(), q: 'toy', minPrice: 20000, maxPrice: 30000 }),
    );

    expect(query.get('make')).toBe('toy');
    expect(query.get('minPrice')).toBe('2000000');
    expect(query.get('maxPrice')).toBe('3000000');
    expect([...query.keys()].sort()).toEqual(['make', 'maxPrice', 'minPrice']);
  });
});

describe('hasServerFilters', () => {
  it('is false when only stock and sort are set, which are applied in the browser', () => {
    expect(hasServerFilters({ ...noFilters(), inStock: true, sort: 'price-asc' })).toBe(false);
  });
});
