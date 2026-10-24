# Trade-offs

Each entry records what was chosen, what was not, and what the choice costs. A new entry is added whenever a block makes a decision a reviewer might question.

---

### 1. Express over NestJS
- **Chosen**: Express 5.
- **Alternative**: NestJS.
- **Why**: Every layer is explicit and easy to follow. Express 5 forwards async errors, so there's no try/catch boilerplate.
- **Cost**: We hand-write the wiring NestJS would generate.

### 2. PostgreSQL on Supabase over local Postgres or SQLite
- **Chosen**: Supabase-hosted PostgreSQL, in one project with separate `dev` and `test` schemas.
- **Alternatives**: Postgres in Docker (not available on the build machine); a local Postgres install; SQLite (no setup).
- **Why**:
  - a real database with atomic conditional updates and case-insensitive search;
  - nothing to install locally;
  - the same database can serve the deployed app.
- **Cost**:
  - tests make network round trips, so the suite runs slower than against a local database;
  - the suite needs an internet connection.

### 3. Prisma 6 pinned over Prisma 7
- **Chosen**: Prisma 6.
- **Alternative**: The latest major version.
- **Why**: Prisma 7 changed its configuration; AI tools and most documentation still target v6.
- **Cost**: Not on the newest release.

### 4. Feature modules with layers over a full hexagonal architecture
- **Chosen**: One folder per feature, with routes, controller, service and repository inside it.
- **Alternative**: Ports and adapters with a shared kernel, unit-of-work and event bus.
- **Why**: Gives the isolation that matters (features don't reach into each other) at a size a reviewer reads in minutes.
- **Cost**: Swapping the database or framework would touch more files than in a full hexagonal design. That is unlikely to matter here.

### 5. Own JWT auth over a hosted auth provider
- **Chosen**: bcrypt and JWT, behind our own `/api/auth/*`.
- **Alternative**: Supabase Auth.
- **Why**: The brief asks for token auth on our own endpoints, built test-first.
- **Cost**: No password reset or email verification. Both are out of scope.

### 6. Admin-only create and update
- **Chosen**: `POST` and `PUT /api/vehicles` require admin.
- **Alternative**: Any logged-in user. The brief marks only delete and restock as admin-only.
- **Why**: The brief gives add and update forms to admins only; leaving the API open would let any customer change prices.
- **Cost**: A deliberate tightening of the written spec, stated in the README.

### 7. List returns out-of-stock vehicles
- **Chosen**: `GET /api/vehicles` returns everything, including quantity 0.
- **Alternative**: Filter out zero stock.
- **Why**: The disabled Purchase button the brief requires can only appear if zero-stock cars are shown.
- **Cost**: "Available" is read as "in the catalogue", not "in stock".

### 8. Atomic conditional decrement over read-then-write
- **Chosen**: One `UPDATE ... WHERE quantity >= n`.
- **Alternative**: Read the stock, check it in code, then write.
- **Why**: Two simultaneous buyers can never take stock below zero.
- **Cost**: A second query is needed to tell "not found" from "not enough stock".

### 9. Price as integer minor units
- **Chosen**: Integer cents, one currency.
- **Alternative**: A float.
- **Why**: Floats produce rounding errors in money.
- **Cost**: Formatting needed at the edges.

### 10. Stock changes only through purchase and restock
- **Chosen**: `quantity` is set on create, then changes only via the two inventory endpoints.
- **Alternative**: Editable through `PUT`.
- **Why**: Every stock change goes through endpoints built and tested for it.
- **Cost**: An admin fixing a typo in the stock count must use restock.

### 11. Tests at slice size
- **Chosen**: One red commit per slice (a few related tests), then green, then refactor where needed.
- **Alternative**: One commit per individual test.
- **Why**: The one-day deadline. The Red-Green-Refactor pattern stays clearly visible.
- **Cost**: Coarser history.

### 12. Deal rating from our own inventory, no scraping
- **Chosen**: Compare each car's price with the median of its category in our inventory.
- **Alternative**: Scrape live prices from other dealership sites.
- **Why**: Scraping breaks most sites' terms of use, fails when their pages change, and can't be verified by a reviewer.
- **Cost**: Ratings reflect our inventory only. The demo seed data is labelled as sample data.

### 13. Token in localStorage
- **Chosen**: localStorage.
- **Alternatives**: Memory only; an httpOnly cookie.
- **Why**: Survives a page refresh and keeps the API stateless.
- **Cost**: Readable by any injected script. A production app would use httpOnly cookies.

### 14. Scope cuts for the one-day deadline
- **Cut**: orders history, natural-language search, MCP server, admin analytics.
- **Stretch**: compare tray, deployment.
- **Why**: The core nine endpoints, the required UI and design quality come first.
- **Cost**: Fewer extras; each can be added later as a new module.

### 15. Passwords capped at 72 characters
- **Chosen**: Register rejects passwords longer than 72 characters with a 400.
- **Alternative**: Accept any length and let bcrypt hash it.
- **Why**: bcrypt ignores every byte past 72, so two long passwords sharing a 72-byte prefix would both log in. Rejecting is honest; silent truncation is not.
- **Cost**: Users with very long passphrases must shorten them. A multi-byte character counts as more than one byte, so the real limit is slightly lower for non-ASCII passwords.

### 16. Emails stored lowercased
- **Chosen**: Emails are trimmed and lowercased on register and login.
- **Alternative**: Store emails as typed, with a case-insensitive unique index (`citext` or a functional index).
- **Why**: The same address can't be registered twice in different case, and login works however the user types it, with a plain unique index.
- **Cost**: The original capitalisation is lost. The seeded admin and demo emails are stored exactly as they appear in config, so they must be written in lowercase there.

### 17. Validated query on res.locals
- **Chosen**: `validate(schema, 'query')` stores the parsed query on `res.locals.query`.
- **Alternative**: Overwrite `req.query`, as Express 4 code often does.
- **Why**: Express 5 makes `req.query` a read-only getter, so assigning to it fails.
- **Cost**: Controllers read the query from `res.locals.query` rather than `req.query`, which a reader must know.
