import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { LandingPage } from '../LandingPage';

const categories = ['SEDAN', 'SUV', 'HATCHBACK', 'COUPE', 'CONVERTIBLE', 'PICKUP', 'VAN'];

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('LandingPage', () => {
  it('has a main heading', () => {
    renderWithProviders(<LandingPage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('links to the showroom', () => {
    renderWithProviders(<LandingPage />);

    expect(screen.getByRole('link', { name: 'Browse the showroom' })).toHaveAttribute(
      'href',
      '/showroom',
    );
  });

  it('links to the showroom filtered by each body style', () => {
    renderWithProviders(<LandingPage />);

    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'));
    for (const category of categories) {
      expect(hrefs).toContain(`/showroom?category=${category}`);
    }
  });

  it('offers "Sign in" when logged out', () => {
    renderWithProviders(<LandingPage />);

    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
  });

  it('makes no network requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    renderWithProviders(<LandingPage />);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
