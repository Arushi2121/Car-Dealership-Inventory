# Car Dealership Inventory System

A full-stack car dealership inventory app, built test-first.

- Customers register, browse the showroom, search and filter vehicles, and purchase them.
- Admins add, edit, delete and restock vehicles.
- Extras beyond the brief:
  - a **deal rating** badge, comparing each car's price with its category;
  - an **EMI calculator** on each vehicle.

## Tech stack

| Layer | Stack |
| --- | --- |
| Backend | Node.js, TypeScript, Express 5, Prisma 6, PostgreSQL (Supabase), Zod, JWT, bcrypt |
| Frontend | React, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query |
| Tests | Vitest, Supertest, React Testing Library, MSW |

## Architecture

The code is split into feature modules, each with its own routes, controller, service and repository, wired together in one place. See [architecture.md](architecture.md). Design decisions and their costs are in [tradeoffs.md](tradeoffs.md).

## API

All `/api/vehicles` routes require `Authorization: Bearer <token>`.

| Method and path | Access | Purpose |
| --- | --- | --- |
| `POST /api/auth/register` | Public | Create an account |
| `POST /api/auth/login` | Public | Get a token |
| `GET /api/vehicles` | User | List all vehicles, including out of stock |
| `GET /api/vehicles/search` | User | Filter by `make`, `model`, `category`, `minPrice`, `maxPrice` |
| `POST /api/vehicles` | Admin | Add a vehicle |
| `PUT /api/vehicles/:id` | Admin | Update a vehicle's details |
| `DELETE /api/vehicles/:id` | Admin | Delete a vehicle |
| `POST /api/vehicles/:id/purchase` | User | Buy (default 1, or `quantity`) |
| `POST /api/vehicles/:id/restock` | Admin | Add `quantity` to stock |
| `GET /api/deal-ratings` | User | Deal rating per vehicle (extra) |

Errors always return `{ "error": { "code": "...", "message": "..." } }`.

## Design decisions

- **`POST` and `PUT /api/vehicles` are admin-only.** The brief marks only delete and restock as admin-only, but gives the add and edit forms to admins; an open API would let any customer change prices.
- **The vehicle list includes out-of-stock cars**, so the disabled Purchase button can appear.
- **Stock changes only through purchase and restock**, and the decrement is atomic, so stock never goes below zero.
- **Admin accounts come from the seed script**; register always creates a normal user.

The full reasoning is in [tradeoffs.md](tradeoffs.md).

## Running locally

_Completed in Block 12._

## Running tests

_Completed in Block 12._

## Test report

_Completed in Block 12._

## Screenshots

_Completed in Block 12._

## My AI Usage

_Completed in Block 12._
