# context.md — Car Dealership Inventory System

Shared reference for **Cursor** (builder) and **Claude** (planner and prompt writer).
Read this file, then `architecture.md`, before every task.

**Order of authority**:

1. Hard rules (Section 1).
2. Owner's guidelines (Section 2).
3. `architecture.md` and this file's working rules.
4. The current block prompt.

If a prompt conflicts with anything above it, **stop and flag the conflict**. Never resolve it silently.

---

## 1. Hard rules (from the kata brief PDF)

### Backend
- Node.js/TypeScript with Express (chosen). A real database (PostgreSQL); **an in-memory database is not sufficient**.
- Users can register and log in. Token-based auth (JWT) secures the protected endpoints.
- Endpoints, at exactly these paths:
  - `POST /api/auth/register`, `POST /api/auth/login`
  - Protected:
    - `POST /api/vehicles`
    - `GET /api/vehicles`
    - `GET /api/vehicles/search` (make, model, category, price range)
    - `PUT /api/vehicles/:id`
    - `DELETE /api/vehicles/:id` (**Admin only**)
  - Protected inventory:
    - `POST /api/vehicles/:id/purchase` (decreases quantity)
    - `POST /api/vehicles/:id/restock` (increases quantity, **Admin only**)
- Every vehicle has a unique ID, make, model, category, price and quantity in stock.

### Frontend
- A single-page app using **HTML5, CSS3, Tailwind and React**, talking to our backend API.
- Must include:
  - registration and login forms;
  - a dashboard showing all vehicles;
  - search and filter;
  - a Purchase button on each vehicle, **disabled when quantity is zero**;
  - admin UI to add, update and delete vehicles.
- Visually appealing, responsive, great UX.

### Process
- **TDD**: tests before code, with a visible Red-Green-Refactor pattern in the commit history (especially backend). High coverage, meaningful tests.
- **Clean code**: readable, SOLID, documented, clear names, meaningful comments.
- **Git**: frequent, descriptive commits that narrate the build.

### AI usage
- Every AI-assisted commit ends with two empty lines, then `Co-authored-by: AI Tool Name <AI@users.noreply.github.com>`.
- README section titled exactly **"My AI Usage"**: which tools, how they were used, and a reflection.
- `PROMPTS.md` at the repo root: **raw, unedited** AI chat logs or public chat links. No AI-generated summaries.

### Deliverables
- A public repository.
- README with:
  - project explanation;
  - local setup for backend and frontend;
  - screenshots;
  - "My AI Usage";
  - a test report.
- `PROMPTS.md`.
- Optional: a live deployed link.

### Plagiarism
- No code copied from other repositories or developers.

---

## 2. Owner's guidelines

- **Deadline: one day.** Scope and pace follow from that.
- **Clean, understandable code. No over-engineering.** Prefer the obvious solution a reviewer reads in one pass.
- **Every feature's code is kept separate**, so changes never break other features (see `architecture.md`).
- **Visually striking design** by professional standards, inspired by the patterns of leading dealership sites. Never copy their designs, copy text or images.
- **Product name**: Marque.
- **Design direction**: light editorial: off-white canvas, white rounded cards, near-black type, one amber accent, pill buttons, photo-led. Inspired by the patterns of premium automotive sites; never copy their layouts, images or copy.
- Cursor builds; Claude writes the block prompts.
- Maintain: `architecture.md`, `tradeoffs.md` (add an entry for every questionable decision), README, `PROMPTS.md`.

### Scope
- **Core (never cut)**: all nine endpoints, plus the required UI from Section 1.
- **Extras**:
  - deal rating badge (module `deal-rating`, endpoint `GET /api/deal-ratings`);
  - EMI calculator (frontend, a pure function).
- **Stretch**: compare tray (up to 3 cars), then deployment.
- **Out of scope**: orders history, natural-language search, MCP server, admin analytics, Supabase Auth.

---

## 3. Stack

| Layer | Choice |
| --- | --- |
| Backend | Node.js LTS, TypeScript, **Express 5**, **Prisma 6** (pinned), PostgreSQL 16 in Docker (dev + test databases), Zod, bcrypt, jsonwebtoken |
| Backend tests | Vitest, Supertest, @vitest/coverage-v8 |
| Frontend | Vite, React, TypeScript, **Tailwind CSS v4** (CSS-first config, tokens in `@theme`, `@tailwindcss/vite` plugin; no `tailwind.config.js`), React Router, TanStack Query |
| Frontend tests | Vitest, React Testing Library, MSW |

If Docker is not available, Supabase hosted Postgres replaces it, used as a database only.

---

## 4. Behaviour decisions

1. `GET /api/vehicles` returns all vehicles, including quantity 0.
2. All vehicle endpoints require a token.
3. `POST` and `PUT /api/vehicles` are admin-only, a stated tightening of the spec.
4. Register always assigns role USER and ignores any `role` field. The admin comes from the seed script (`ADMIN_EMAIL`, `ADMIN_PASSWORD`), which is safe to rerun.
5. Purchase takes 1 by default, or an optional positive-integer `quantity`. It returns 409 if stock is insufficient.
6. The stock decrement is atomic, a single conditional update.
7. Restock takes `{ "quantity": n }`, where n is a positive integer.
8. Search:
   - `make` and `model` match partially, ignoring case;
   - `category` matches exactly;
   - `minPrice` and `maxPrice` are inclusive;
   - filters combine;
   - a bad range returns 400.
9. Price is an integer in minor units (cents), in USD.
10. `quantity` is not editable through `PUT`.
11. Status codes and errors:
    - 401 means a missing, invalid or expired token; 403 means not an admin;
    - login gives one error for a wrong email and a wrong password alike;
    - no response ever contains `passwordHash`;
    - every error uses the shape `{ "error": { "code", "message" } }`.

---

## 5. Working rules for Cursor

1. Read `context.md` and `architecture.md` first, every task.
2. Touch only the files the block names. Don't refactor unrelated code.
3. **RED**: write the tests only, run them, show the failing output, **stop**.
4. **GREEN**: write the least code that passes, run the full suite, show the output, **stop**.
5. **REFACTOR**: no behaviour change; the suite stays green; **stop**.
6. Never edit or delete an existing test to make code pass. If a test looks wrong, stop and say why.
7. Never change the nine endpoint paths or the vehicle's required fields.
8. Ask before adding any dependency not listed in Section 3.
9. **Never run `git commit` or `git push`.** At each stop, propose a commit message (Section 6). The owner commits.
10. No secrets in code. Config comes from env vars, listed in `.env.example`.
11. Write code fresh. Never reproduce code from other repositories.
12. Keep it simple:
    - small functions and descriptive names;
    - no clever abstractions, no DI container, no premature generics;
    - comments explain *why*, not *what*.
13. Frontend: every colour, font and spacing value comes from the design tokens. Use only original, AI-generated or properly licensed images.
14. When a block makes a decision a reviewer might question, add an entry to `tradeoffs.md`.

---

## 6. Commits

- **Prefixes**:
  - `test:` for red;
  - `feat:` or `fix:` for green;
  - `refactor:`;
  - `chore:`, `docs:` or `build:` for setup.
- **Message**: a subject under 72 characters. The body says what was done and what the AI did.
- **Trailer**: AI-assisted commits end with the trailer from Section 1.
- **History**: never squash, rebase away or force-push.
- **Trailer**: Owner decision: commits do not carry the Co-authored-by trailer, because the brief's noreply address links to an unrelated GitHub user. AI involvement is disclosed in README "My AI Usage" and PROMPTS.md instead. Do not propose the trailer.

### Definition of done for a block
- [ ] Red commit with failing tests (where the block has logic)
- [ ] Green commit; full suite passes
- [ ] No lint or type errors
- [ ] `tradeoffs.md` updated if a decision was made
- [ ] Block's Cursor chat saved raw for `PROMPTS.md`
