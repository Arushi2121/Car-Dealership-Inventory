# Architecture

## Goals

1. **Isolation**: changing or adding a feature does not break another.
2. **Readability**: a reviewer understands any file on first read.
3. **Testability**: business rules are tested without HTTP or a database; endpoints are tested through real HTTP against a real database.

The shape that meets all three without over-engineering is **feature modules with layers inside each module**, wired together in one place.

---

## Backend

### Request flow

```
HTTP request
   │
   ▼
Router ──► authenticate (401) ──► requireAdmin (403) ──► validate body/query with Zod (400)
   │
   ▼
Controller   reads the request, calls one service method, sends status + JSON
   │
   ▼
Service      business rules; throws named errors; knows nothing about HTTP or Prisma
   │
   ▼
Repository   the only code that talks to Prisma
   │
   ▼
PostgreSQL
```

Errors thrown anywhere reach one error handler, which turns them into a status code and the standard error shape. Express 5 forwards rejected promises to the error handler, so controllers need no try/catch.

### Folder structure

```
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                 admin user + demo vehicles
├── src/
│   ├── app.ts                  createApp(deps): builds the Express app, mounts module routers. No listen().
│   ├── server.ts               reads config, creates the Prisma client, calls createApp, listens.
│   ├── shared/                 used by every module; imports no module
│   │   ├── config.ts           reads and validates env vars with Zod
│   │   ├── db.ts               Prisma client factory
│   │   ├── errors.ts           AppError and its subclasses
│   │   ├── auth/token.ts       sign and verify JWTs
│   │   └── http/               errorHandler, notFound, validate, authenticate, requireAdmin
│   └── modules/
│       ├── auth/
│       ├── vehicles/
│       ├── inventory/
│       └── deal-rating/
└── tests/
    ├── setup.ts                test database guard + reset between tests
    └── helpers/                createTestApp, createUserWithToken, makeVehicle, resetDatabase
```

### Inside a module

```
modules/vehicles/
├── index.ts                 public contract: router factory + types other modules may use
├── vehicles.routes.ts       paths, guards and validation, mapped to controller methods
├── vehicles.controller.ts
├── vehicles.service.ts
├── vehicles.repository.ts   interface + Prisma implementation
├── vehicles.schemas.ts      Zod schemas for bodies and queries
└── __tests__/
    ├── vehicles.service.test.ts       unit: service with a fake repository
    └── vehicles.routes.test.ts        integration: Supertest against the test database
```

### Dependency rules

1. **Modules may import `shared/`. `shared/` never imports a module.**
2. **A module may import another module only through its `index.ts`**, and only where the dependency is listed below. No cycles.
3. **`app.ts` is the only place that constructs and wires things.** No DI container: plain constructor or factory parameters.
4. **Each layer stays in its lane.** Controllers hold no business logic and no Prisma. Services touch no `req`/`res` and no Prisma. Repositories hold no business rules.

| Module | Depends on | Why |
| --- | --- | --- |
| auth | shared | |
| vehicles | shared | |
| inventory | vehicles (StockRepository interface) | Stock lives on the Vehicle table, which vehicles owns. Inventory holds the purchase and restock rules; vehicles holds the stock SQL. |
| deal-rating | vehicles (repository interface) | Reads prices to compare |

### Wiring example

```ts
// app.ts (shape only)
export function createApp({ prisma, config }: AppDeps) {
  const app = express();
  app.use(express.json());

  const vehicleRepo = new PrismaVehicleRepository(prisma);

  app.use('/api/auth', authRouter(new AuthService(new PrismaUserRepository(prisma), config)));
  app.use('/api/vehicles', vehiclesRouter(new VehicleService(vehicleRepo), config));
  app.use('/api/vehicles', inventoryRouter(new InventoryService(new PrismaStockRepository(prisma)), config));
  app.use('/api/deal-ratings', dealRatingRouter(new DealRatingService(vehicleRepo), config));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
```

### Adding a feature

1. Create `src/modules/<name>/` with the files above.
2. Add its models, if any, to `schema.prisma` and create a migration.
3. Mount its router in `app.ts`, which is one line.
4. Its tests live in its own folder. Every existing test must still pass untouched.

### Data model

| Model | Fields |
| --- | --- |
| User | `id` (uuid), `email` (unique), `passwordHash`, `name` (optional), `role` (USER or ADMIN), `createdAt` |
| Vehicle | `id` (uuid), `make`, `model`, `category` (enum), `price` (integer, minor currency units), `quantity` (integer ≥ 0), `imageUrl` (optional), `createdAt`, `updatedAt` |

The category enum is a fixed list defined in Block 3. Price is stored in minor units (cents), with one currency, USD, shown in the UI.

### Key behaviours

- **Auth**:
  - register hashes the password with bcrypt and always assigns role USER;
  - login returns a JWT `{ sub, role }` with an expiry set from config;
  - `authenticate` verifies the token and sets `req.user`;
  - `requireAdmin` checks the role.
- **Admin creation**: the seed script, from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Never through register.
- **Stock**: one conditional update, `updateMany({ where: { id, quantity: { gte: n } }, data: { quantity: { decrement: n } } })`. A count of 0 means either a missing vehicle (404) or not enough stock (409); the service checks which.
- **Errors**: every failure returns `{ "error": { "code": "...", "message": "..." } }`.

| Error class | Status |
| --- | --- |
| ValidationError | 400 |
| UnauthorizedError | 401 |
| ForbiddenError | 403 |
| NotFoundError | 404 |
| ConflictError | 409 |

### Testing levels

| Level | What | Database |
| --- | --- | --- |
| Unit | Services and pure functions, with fake repositories | None |
| Integration | Each endpoint through Supertest, using `createApp` | Real Postgres test database, emptied before each test |

The fake repositories are test doubles for unit tests. The running app always uses Postgres, as the brief requires.

---

## Frontend

### Folder structure

```
frontend/src/
├── app/                App.tsx (routes), providers.tsx, ShowroomRoute, layouts/
│   └── layouts/        SiteHeader, AppHeader
├── shared/
│   ├── ui/             Button, Input, Select, Card, Badge, Dialog, Skeleton (design system primitives)
│   └── lib/            api.ts (fetch wrapper: base URL, token, error shape), format.ts (currency)
├── features/
│   ├── auth/           AuthProvider, useAuth, LoginPage, RegisterPage, RequireAuth, RequireAdmin
│   ├── landing/        LandingPage (public, no API calls)
│   ├── vehicles/       ShowroomPage, VehicleCard, SearchBar, hooks, api
│   ├── deals/          DealBadge, useDealRatings
│   ├── finance/        emi.ts (pure function), EmiCalculator
│   └── admin/          VehicleFormDialog, RestockDialog, DeleteVehicleDialog, AdminCardActions
└── styles/index.css    Tailwind v4 with design tokens in @theme
```

The same rules as the backend apply: features import `shared/` and other features only through their `index.ts`.

Admin UI is plugged into the showroom through props, composed in `app/ShowroomRoute.tsx`, so the vehicles feature never depends on admin.

### State and data

- **Server data**: TanStack Query. It handles loading, error and refetch, and stock is refreshed after a purchase by invalidating the query.
- **Session**: AuthProvider, with the token in localStorage.
- **Everything else**: local component state. No global store.
- **Design**: every colour, font and spacing value comes from the `@theme` tokens. No ad-hoc values in components.
