import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { ShowroomRoute } from '../../../app/ShowroomRoute';
import { saveSession } from '../../auth/session';
import { makeSession } from '../../../test/fakeSession';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { server } from '../../../test/server';

const API_URL = import.meta.env.VITE_API_URL;

type Vehicle = {
  id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type User = ReturnType<typeof userEvent.setup>;

function makeVehicle(
  fields: Pick<Vehicle, 'id' | 'make' | 'model' | 'category' | 'price' | 'quantity'>,
): Vehicle {
  return {
    imageUrl: null,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...fields,
  };
}

// A tiny in-memory backend: mutations change what later list requests return.
let vehicles: Vehicle[];
let listRequests: number;
let ratingRequests: number;
let createBodies: unknown[];
let updateBodies: unknown[];
let restockBodies: unknown[];
let deletedIds: string[];

beforeEach(() => {
  vehicles = [
    makeVehicle({
      id: 'camry-1',
      make: 'Toyota',
      model: 'Camry',
      category: 'SEDAN',
      price: 2000000,
      quantity: 4,
    }),
    makeVehicle({
      id: 'civic-1',
      make: 'Honda',
      model: 'Civic',
      category: 'SEDAN',
      price: 2500000,
      quantity: 0,
    }),
  ];
  listRequests = 0;
  ratingRequests = 0;
  createBodies = [];
  updateBodies = [];
  restockBodies = [];
  deletedIds = [];

  server.use(
    http.get(`${API_URL}/api/vehicles`, () => {
      listRequests += 1;
      return HttpResponse.json(vehicles);
    }),
    http.get(`${API_URL}/api/deal-ratings`, () => {
      ratingRequests += 1;
      return HttpResponse.json([]);
    }),
    http.post(`${API_URL}/api/vehicles`, async ({ request }) => {
      const body = (await request.json()) as Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;
      createBodies.push(body);
      const created = makeVehicle({ id: 'new-1', ...body });
      vehicles.push(created);
      return HttpResponse.json(created, { status: 201 });
    }),
    http.put(`${API_URL}/api/vehicles/:id`, async ({ params, request }) => {
      const body = (await request.json()) as Partial<Vehicle>;
      updateBodies.push(body);
      const vehicle = vehicles.find((v) => v.id === params.id)!;
      Object.assign(vehicle, body);
      return HttpResponse.json(vehicle);
    }),
    http.post(`${API_URL}/api/vehicles/:id/restock`, async ({ params, request }) => {
      const body = (await request.json()) as { quantity: number };
      restockBodies.push(body);
      const vehicle = vehicles.find((v) => v.id === params.id)!;
      vehicle.quantity += body.quantity;
      return HttpResponse.json(vehicle);
    }),
    http.delete(`${API_URL}/api/vehicles/:id`, ({ params }) => {
      deletedIds.push(params.id as string);
      vehicles = vehicles.filter((v) => v.id !== params.id);
      return new HttpResponse(null, { status: 204 });
    }),
  );
});

afterEach(() => localStorage.clear());

function renderShowroomAs(role: 'USER' | 'ADMIN') {
  saveSession(makeSession(role));
  return renderWithProviders(<ShowroomRoute />, { initialEntries: ['/showroom'] });
}

async function findCard(name: string) {
  return within(await screen.findByRole('article', { name: new RegExp(name) }));
}

async function findDialog(name: string | RegExp) {
  return within(await screen.findByRole('dialog', { name }));
}

async function expectDialogClosed() {
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
}

async function expectStatus(text: string) {
  await waitFor(() => {
    const messages = screen.getAllByRole('status').map((element) => element.textContent);
    expect(messages.some((message) => message?.includes(text))).toBe(true);
  });
}

/** An inline error marks the field invalid and describes it with the message. */
function expectFieldError(field: HTMLElement) {
  expect(field).toHaveAttribute('aria-invalid', 'true');
  expect(field).toHaveAccessibleDescription(/\S/);
}

async function replaceValue(user: User, field: HTMLElement, value: string) {
  await user.clear(field);
  await user.type(field, value);
}

async function openAddDialog(user: User) {
  await user.click(await screen.findByRole('button', { name: 'Add vehicle' }));
  return findDialog('Add vehicle');
}

async function fillValidNewCar(user: User, dialog: ReturnType<typeof within>) {
  await user.type(dialog.getByLabelText('Make'), 'Mazda');
  await user.type(dialog.getByLabelText('Model'), 'CX-5');
  await user.selectOptions(dialog.getByLabelText('Body style'), 'SUV');
  await replaceValue(user, dialog.getByLabelText('Price (USD)'), '24999');
  await replaceValue(user, dialog.getByLabelText('Quantity'), '3');
}

function submitAdd(user: User, dialog: ReturnType<typeof within>) {
  return user.click(dialog.getByRole('button', { name: /add vehicle/i }));
}

async function addMazda(user: User) {
  const dialog = await openAddDialog(user);
  await fillValidNewCar(user, dialog);
  await submitAdd(user, dialog);
}

async function editCamryPrice(user: User) {
  const camry = await findCard('Toyota Camry');
  await user.click(camry.getByRole('button', { name: 'Edit Toyota Camry' }));
  const dialog = await findDialog('Edit Toyota Camry');
  await replaceValue(user, dialog.getByLabelText('Price (USD)'), '21000');
  await user.click(dialog.getByRole('button', { name: /save/i }));
}

async function openRestockCivic(user: User) {
  const civic = await findCard('Honda Civic');
  await user.click(civic.getByRole('button', { name: 'Restock Honda Civic' }));
  return findDialog(/Restock Honda Civic/);
}

async function restockCivic(user: User, quantity: string) {
  const dialog = await openRestockCivic(user);
  await replaceValue(user, dialog.getByLabelText('Quantity'), quantity);
  await user.click(dialog.getByRole('button', { name: /restock/i }));
  return dialog;
}

async function openDeleteCamry(user: User) {
  const camry = await findCard('Toyota Camry');
  await user.click(camry.getByRole('button', { name: 'Delete Toyota Camry' }));
  return within(await screen.findByRole('dialog'));
}

async function deleteCamry(user: User) {
  const dialog = await openDeleteCamry(user);
  await user.click(dialog.getByRole('button', { name: /^delete/i }));
}

describe('Admin showroom controls', () => {
  it('shows "Add vehicle" and per-car Edit, Restock and Delete buttons to an admin', async () => {
    renderShowroomAs('ADMIN');

    expect(await screen.findByRole('button', { name: 'Add vehicle' })).toBeInTheDocument();
    for (const car of ['Toyota Camry', 'Honda Civic']) {
      const card = await findCard(car);
      expect(card.getByRole('button', { name: `Edit ${car}` })).toBeInTheDocument();
      expect(card.getByRole('button', { name: `Restock ${car}` })).toBeInTheDocument();
      expect(card.getByRole('button', { name: `Delete ${car}` })).toBeInTheDocument();
    }
  });

  it('shows none of the admin controls to a regular user', async () => {
    renderShowroomAs('USER');
    await findCard('Toyota Camry');

    const adminControl = /^(Add vehicle|Edit|Restock|Delete)\b/;
    expect(screen.queryAllByRole('button', { name: adminControl })).toHaveLength(0);
  });
});

describe('Adding a vehicle', () => {
  it('opens a dialog with every vehicle field', async () => {
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');

    const dialog = await openAddDialog(user);

    for (const label of [
      'Make',
      'Model',
      'Body style',
      'Price (USD)',
      'Quantity',
      'Image URL (optional)',
    ]) {
      expect(dialog.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it('shows inline errors for an empty form and sends nothing', async () => {
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');
    const dialog = await openAddDialog(user);

    await submitAdd(user, dialog);

    await waitFor(() => expectFieldError(dialog.getByLabelText('Make')));
    expectFieldError(dialog.getByLabelText('Model'));
    expectFieldError(dialog.getByLabelText('Price (USD)'));
    expect(createBodies).toHaveLength(0);
  });

  it.each(['0', '12.5'])('rejects a price of "%s" inline', async (price) => {
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');
    const dialog = await openAddDialog(user);
    await fillValidNewCar(user, dialog);

    await replaceValue(user, dialog.getByLabelText('Price (USD)'), price);
    await submitAdd(user, dialog);

    await waitFor(() => expectFieldError(dialog.getByLabelText('Price (USD)')));
    expect(createBodies).toHaveLength(0);
  });

  it('rejects a negative quantity inline', async () => {
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');
    const dialog = await openAddDialog(user);
    await fillValidNewCar(user, dialog);

    await replaceValue(user, dialog.getByLabelText('Quantity'), '-1');
    await submitAdd(user, dialog);

    await waitFor(() => expectFieldError(dialog.getByLabelText('Quantity')));
    expect(createBodies).toHaveLength(0);
  });

  it('posts the price in cents, closes, confirms and shows the new card', async () => {
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');

    await addMazda(user);

    await waitFor(() =>
      expect(createBodies).toEqual([
        { make: 'Mazda', model: 'CX-5', category: 'SUV', price: 2499900, quantity: 3 },
      ]),
    );
    await expectDialogClosed();
    await expectStatus('Vehicle added');
    expect(await findCard('Mazda CX-5')).toBeTruthy();
  });

  it('keeps the dialog open and shows a server validation error', async () => {
    server.use(
      http.post(`${API_URL}/api/vehicles`, () =>
        HttpResponse.json(
          { error: { code: 'VALIDATION_ERROR', message: 'Image URL must be a valid URL' } },
          { status: 400 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');

    await addMazda(user);

    const dialog = await findDialog('Add vehicle');
    expect(await dialog.findByRole('alert')).toHaveTextContent('Image URL must be a valid URL');
  });
});

describe('Editing a vehicle', () => {
  it('opens prefilled, without a quantity field', async () => {
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');
    const camry = await findCard('Toyota Camry');

    await user.click(camry.getByRole('button', { name: 'Edit Toyota Camry' }));

    const dialog = await findDialog('Edit Toyota Camry');
    expect(dialog.getByLabelText('Make')).toHaveDisplayValue('Toyota');
    expect(dialog.getByLabelText('Model')).toHaveDisplayValue('Camry');
    expect(dialog.getByLabelText('Body style')).toHaveValue('SEDAN');
    expect(dialog.getByLabelText('Price (USD)')).toHaveDisplayValue('20000');
    expect(dialog.queryByLabelText('Quantity')).not.toBeInTheDocument();
  });

  it('puts only the changed fields and shows the new price', async () => {
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');

    await editCamryPrice(user);

    await waitFor(() => expect(updateBodies).toEqual([{ price: 2100000 }]));
    await expectStatus('Vehicle updated');
    const camry = await findCard('Toyota Camry');
    expect(await camry.findByText('$21,000')).toBeInTheDocument();
  });
});

describe('Restocking a vehicle', () => {
  it('defaults the quantity to 1', async () => {
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');

    const dialog = await openRestockCivic(user);

    expect(dialog.getByLabelText('Quantity')).toHaveDisplayValue('1');
  });

  it('posts the quantity, confirms and enables purchase', async () => {
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');

    await restockCivic(user, '5');

    await waitFor(() => expect(restockBodies).toEqual([{ quantity: 5 }]));
    await expectStatus('Honda Civic restocked · 5 in stock');
    const civic = await findCard('Honda Civic');
    expect(await civic.findByRole('button', { name: 'Purchase' })).toBeEnabled();
  });

  it.each(['0', '10001'])('rejects a quantity of %s inline', async (quantity) => {
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');

    const dialog = await restockCivic(user, quantity);

    await waitFor(() => expectFieldError(dialog.getByLabelText('Quantity')));
    expect(restockBodies).toHaveLength(0);
  });
});

describe('Deleting a vehicle', () => {
  it('asks for confirmation', async () => {
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');

    const dialog = await openDeleteCamry(user);

    expect(dialog.getByText('Delete Toyota Camry?')).toBeInTheDocument();
  });

  it('does nothing on cancel', async () => {
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');
    const dialog = await openDeleteCamry(user);

    await user.click(dialog.getByRole('button', { name: 'Cancel' }));

    await expectDialogClosed();
    expect(deletedIds).toHaveLength(0);
    expect(await findCard('Toyota Camry')).toBeTruthy();
  });

  it('deletes on confirm, removes the card and confirms', async () => {
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');

    await deleteCamry(user);

    await waitFor(() => expect(deletedIds).toEqual(['camry-1']));
    await waitFor(() =>
      expect(screen.queryByRole('article', { name: /Toyota Camry/ })).not.toBeInTheDocument(),
    );
    await expectStatus('Toyota Camry deleted');
  });

  it('explains a car that was already removed and refetches the list', async () => {
    server.use(
      http.delete(`${API_URL}/api/vehicles/:id`, () =>
        HttpResponse.json(
          { error: { code: 'VEHICLE_NOT_FOUND', message: 'Vehicle not found' } },
          { status: 404 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');
    await findCard('Toyota Camry');
    const listCount = listRequests;

    await deleteCamry(user);

    await expectStatus('This car was already removed');
    await waitFor(() => expect(listRequests).toBeGreaterThan(listCount));
  });
});

describe('Deal ratings after admin changes', () => {
  it.each([
    ['adding', addMazda],
    ['editing', editCamryPrice],
    ['restocking', (user: User) => restockCivic(user, '5')],
    ['deleting', deleteCamry],
  ])('refetches deal ratings after %s a car', async (_, mutate) => {
    const user = userEvent.setup();
    renderShowroomAs('ADMIN');
    await findCard('Toyota Camry');
    await waitFor(() => expect(ratingRequests).toBeGreaterThan(0));
    const ratingCount = ratingRequests;

    await mutate(user);

    await waitFor(() => expect(ratingRequests).toBeGreaterThan(ratingCount));
  });
});
