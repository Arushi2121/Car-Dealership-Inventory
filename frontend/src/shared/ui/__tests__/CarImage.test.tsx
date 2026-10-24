import { fireEvent, render, screen } from '@testing-library/react';
import { CarImage } from '..';

describe('CarImage', () => {
  it('shows the body-style photo when the car has no image URL', () => {
    render(<CarImage make="Honda" model="CR-V" category="SUV" />);

    const img = screen.getByRole('img', { name: 'Honda CR-V' });
    expect(img).toHaveAttribute('src', '/images/suv.jpg');
  });

  it("uses the car's own image URL when set", () => {
    render(
      <CarImage make="Honda" model="CR-V" category="SUV" imageUrl="https://example.com/cr-v.jpg" />,
    );

    expect(screen.getByRole('img', { name: 'Honda CR-V' })).toHaveAttribute(
      'src',
      'https://example.com/cr-v.jpg',
    );
  });

  it('replaces a photo that fails to load with a labelled placeholder', () => {
    render(<CarImage make="Honda" model="CR-V" category="SUV" />);
    const img = screen.getByRole('img', { name: 'Honda CR-V' });

    fireEvent.error(img);

    expect(img).not.toBeInTheDocument();
    const placeholder = screen.getByRole('img', { name: /SUV/ });
    expect(placeholder.tagName).not.toBe('IMG');
  });

  it.each([
    ['SEDAN', '/images/sedan.jpg'],
    ['SUV', '/images/suv.jpg'],
    ['HATCHBACK', '/images/hatchback.jpg'],
    ['COUPE', '/images/coupe.jpg'],
    ['CONVERTIBLE', '/images/convertible.jpg'],
    ['PICKUP', '/images/pickup.jpg'],
    ['VAN', '/images/van.jpg'],
  ] as const)('maps %s to %s', (category, src) => {
    render(<CarImage make="Test" model="Car" category={category} />);

    expect(screen.getByRole('img', { name: 'Test Car' })).toHaveAttribute('src', src);
  });
});
