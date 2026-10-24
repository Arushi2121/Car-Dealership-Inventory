import { render, screen } from '@testing-library/react';
import { Badge } from '..';

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>In stock</Badge>);

    expect(screen.getByText('In stock')).toBeInTheDocument();
  });

  it.each(['great', 'fair', 'above', 'neutral'] as const)('renders the %s tone', (tone) => {
    render(<Badge tone={tone}>Deal</Badge>);

    expect(screen.getByText('Deal')).toBeInTheDocument();
  });
});
