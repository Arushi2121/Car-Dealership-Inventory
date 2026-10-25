import { useLocation } from 'react-router';

/** Prints the current path and query so tests can assert where navigation ended up. */
export function LocationDisplay() {
  const { pathname, search } = useLocation();
  return <p data-testid="location">{pathname + search}</p>;
}
