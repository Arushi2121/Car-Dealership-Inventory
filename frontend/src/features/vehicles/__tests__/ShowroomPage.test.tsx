import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { saveSession } from '../../auth/session';
import { makeSession } from '../../../test/fakeSession';
import { LocationDisplay } from '../../../test/LocationDisplay';
import { renderWithProviders } from '../../../test/renderWithProviders';
import { server } from '../../../test/server';
import { ShowroomPage } from '../ShowroomPage';

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

const ratings = [
  { vehicleId: 'camry-1', rating: 'GREAT', categoryMedian: 2500000, differencePercent: -20 },
  { vehicleId: 'civic-1', rating: 'FAIR', categoryMedian: 2500000, differencePercent: 0 },
  { vehicleId: 'ranger-1', rating: null, categoryMedian: null, differencePercent: null },
];

// Mutable, so a purchase is reflected in later list requests the way the real API is.
let vehicles: Vehicle[];
let requests: URL[];

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
    makeVehicle({
      id: 'ranger-1',
      make: 'Ford',
      model: 'Ranger',
      category: 'PICKUP',
      price: 3500000,
      quantity: 2,
    }),
  ];
  requests = [];
  saveSession(makeSession('USER'));

  server.use(
    http.get(`${API_URL}/api/vehicles`, ({ request }) => {
      requests.push(new URL(request.url));
      return HttpResponse.json(vehicles);
    }),
    http.get(`${API_URL}/api/vehicles/search`, ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      const category = url.searchParams.get('category');
      return HttpResponse.json(vehicles.filter((v) => !category || v.category === category));
    }),
    http.get(`${API_URL}/api/deal-ratings`, () => HttpResponse.json(ratings)),
  );
});

afterEach(() => localStorage.clear());

function renderShowroom(entry = '/showroom') {
  return renderWithProviders(
    <>
      <ShowroomPage />
      <LocationDisplay />
    </>,
    { initialEntries: [entry] },
  );
}

/** Each vehicle is an article named after its make and model. */
async function findCard(name: string) {
  return within(await screen.findByRole('article', { name: new RegExp(name) }));
}

function listRequests() {
  return requests.filter((url) => url.pathname === '/api/vehicles');
}

function searchRequests() {
  return requests.filter((url) => url.pathname === '/api/vehicles/search');
}

function location() {
  return screen.getByTestId('location').textContent;
}

async function expectStatus(text: string) {
  await waitFor(() => {
    const messages = screen.getAllByRole('status').map((element) => element.textContent);
    expect(messages.some((message) => message?.includes(text))).toBe(true);
  });
}

describe('ShowroomPage', () => {
  it('shows a card per vehicle with its price and a monthly estimate', async () => {
    renderShowroom();

    const camry = await findCard('Toyota Camry');
    expect(camry.getByText('$20,000')).toBeInTheDocument();
    expect(camry.getByText(/from \$[\d,]+\/mo/)).toBeInTheDocument();
    expect(await findCard('Honda Civic')).toBeTruthy();
    expect(await findCard('Ford Ranger')).toBeTruthy();
    expect(screen.getAllByRole('article')).toHaveLength(3);
  });

  it('disables purchase for a car with no stock', async () => {
    renderShowroom();

    const civic = await findCard('Honda Civic');
    expect(civic.getByRole('button', { name: 'Out of stock' })).toBeDisabled();
    const camry = await findCard('Toyota Camry');
    expect(camry.getByRole('button', { name: 'Purchase' })).toBeEnabled();
  });

  it('shows a deal badge only for rated cars', async () => {
    renderShowroom();

    const camry = await findCard('Toyota Camry');
    expect(await camry.findByText('Great price')).toBeInTheDocument();
    const ranger = await findCard('Ford Ranger');
    expect(ranger.queryByText(/Great price|Fair price|Above market/)).not.toBeInTheDocument();
  });

  it('warns when stock is low', async () => {
    renderShowroom();

    const ranger = await findCard('Ford Ranger');
    expect(ranger.getByText('Only 2 left')).toBeInTheDocument();
  });

  it('searches by the category in the URL', async () => {
    renderShowroom('/showroom?category=PICKUP');

    await findCard('Ford Ranger');
    expect(searchRequests().some((url) => url.searchParams.get('category') === 'PICKUP')).toBe(
      true,
    );
  });

  it('searches by make after typing in the search box', async () => {
    const user = userEvent.setup();
    renderShowroom();
    await findCard('Toyota Camry');

    await user.type(screen.getByRole('searchbox', { name: 'Search make or model' }), 'toy');

    await waitFor(() =>
      expect(searchRequests().some((url) => url.searchParams.get('make') === 'toy')).toBe(true),
    );
  });

  it('hides out-of-stock cars with "In stock only", without a new request', async () => {
    const user = userEvent.setup();
    renderShowroom();
    await findCard('Honda Civic');
    const requestCount = requests.length;

    await user.click(screen.getByLabelText('In stock only'));

    await waitFor(() =>
      expect(screen.queryByRole('article', { name: /Honda Civic/ })).not.toBeInTheDocument(),
    );
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(requests).toHaveLength(requestCount);
  });

  it('sorts by price, high to low', async () => {
    const user = userEvent.setup();
    renderShowroom();
    await findCard('Toyota Camry');

    await user.selectOptions(screen.getByLabelText('Sort'), 'Price: high to low');

    await waitFor(() =>
      expect(screen.getAllByRole('article')[0]).toHaveAccessibleName(/Ford Ranger/),
    );
  });

  it('purchases a car after a confirming second click', async () => {
    let purchaseBody: unknown = null;
    server.use(
      http.post(`${API_URL}/api/vehicles/:id/purchase`, async ({ params, request }) => {
        purchaseBody = await request.json();
        const vehicle = vehicles.find((v) => v.id === params.id)!;
        vehicle.quantity -= 1;
        return HttpResponse.json(vehicle);
      }),
    );
    const user = userEvent.setup();
    renderShowroom();
    const camry = await findCard('Toyota Camry');

    await user.click(camry.getByRole('button', { name: 'Purchase' }));
    await user.click(camry.getByRole('button', { name: 'Confirm · $20,000' }));

    await waitFor(() => expect(purchaseBody).toEqual({ quantity: 1 }));
    await expectStatus('Toyota Camry purchased');
    expect(await camry.findByText(/\b3 (in stock|left)\b/)).toBeInTheDocument();
  });

  it('explains a sold-out purchase and refetches the list', async () => {
    server.use(
      http.post(`${API_URL}/api/vehicles/:id/purchase`, () =>
        HttpResponse.json(
          { error: { code: 'OUT_OF_STOCK', message: 'Not enough stock' } },
          { status: 409 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderShowroom();
    const camry = await findCard('Toyota Camry');
    const listCount = listRequests().length;

    await user.click(camry.getByRole('button', { name: 'Purchase' }));
    await user.click(camry.getByRole('button', { name: 'Confirm · $20,000' }));

    await expectStatus('Someone just bought the last one');
    await waitFor(() => expect(listRequests().length).toBeGreaterThan(listCount));
  });

  it('offers to clear filters when nothing matches', async () => {
    server.use(http.get(`${API_URL}/api/vehicles/search`, () => HttpResponse.json([])));
    const user = userEvent.setup();
    renderShowroom('/showroom?category=PICKUP');

    expect(await screen.findByText('No cars match your filters')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    await waitFor(() => expect(location()).toBe('/showroom'));
  });

  it('shows an error with a retry when the list fails', async () => {
    let failNext = true;
    server.use(
      http.get(`${API_URL}/api/vehicles`, () => {
        if (failNext) {
          failNext = false;
          return HttpResponse.json(
            { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } },
            { status: 500 },
          );
        }
        return HttpResponse.json(vehicles);
      }),
    );
    const user = userEvent.setup();
    renderShowroom();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await findCard('Toyota Camry')).toBeTruthy();
  });

  it('opens a details dialog from the URL and closes it with Escape', async () => {
    const user = userEvent.setup();
    renderShowroom();
    const camry = await findCard('Toyota Camry');

    await user.click(camry.getByRole('button', { name: /View details/ }));

    const dialog = await screen.findByRole('dialog', { name: /Toyota Camry/ });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(location()).toBe('/showroom?car=camry-1');

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(location()).toBe('/showroom');
  });

  it('explains the deal rating in the details dialog', async () => {
    renderShowroom('/showroom?car=camry-1');

    const dialog = within(await screen.findByRole('dialog', { name: /Toyota Camry/ }));
    expect(await dialog.findByText(/20% below the Sedan median of \$25,000/)).toBeInTheDocument();
  });

  it('updates the monthly estimate when the term changes', async () => {
    const user = userEvent.setup();
    renderShowroom('/showroom?car=camry-1');
    const dialog = within(await screen.findByRole('dialog', { name: /Toyota Camry/ }));

    // $18,000 financed at 7.5%: about $360/mo over 60 months, $559/mo over 36.
    expect(dialog.getAllByText('$360/mo', { exact: false }).length).toBeGreaterThan(0);
    await user.selectOptions(dialog.getByLabelText('Term'), '36 months');

    expect(await dialog.findByText('$559/mo', { exact: false })).toBeInTheDocument();
  });

  it('shows no admin controls to a regular user', async () => {
    renderShowroom();
    await findCard('Toyota Camry');

    const adminControl = /^(Add vehicle|Edit|Delete|Restock)/;
    expect(screen.queryAllByRole('button', { name: adminControl })).toHaveLength(0);
    expect(screen.queryAllByRole('link', { name: adminControl })).toHaveLength(0);
  });
});
