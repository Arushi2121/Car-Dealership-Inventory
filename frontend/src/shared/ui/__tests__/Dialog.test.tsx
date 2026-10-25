import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog } from '../Dialog';

function renderDialog(onClose = vi.fn()) {
  render(
    <Dialog title="Add vehicle" onClose={onClose}>
      <p>Dialog body</p>
      <button type="button">Save</button>
    </Dialog>,
  );
  return onClose;
}

describe('Dialog', () => {
  it('renders a modal dialog named by its title, with its children', () => {
    renderDialog();

    const dialog = screen.getByRole('dialog', { name: 'Add vehicle' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Dialog body')).toBeInTheDocument();
  });

  it('calls onClose on Escape', async () => {
    const user = userEvent.setup();
    const onClose = renderDialog();

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('moves focus into the dialog on open', () => {
    renderDialog();

    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
  });
});
