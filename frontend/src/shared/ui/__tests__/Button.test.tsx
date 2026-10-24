import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '..';

describe('Button', () => {
  it('renders its label and fires onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Purchase</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Purchase' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Purchase
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Purchase' });

    await userEvent.click(button);

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('is disabled and busy while loading, keeping its label', () => {
    render(<Button loading>Purchase</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Purchase')).toBeInTheDocument();
  });

  it.each(['primary', 'dark', 'ghost'] as const)('renders the %s variant', (variant) => {
    render(<Button variant={variant}>Go</Button>);

    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });
});
