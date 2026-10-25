i want to make it insane. the website should be visually appealing by design standards. and cursor will help. we will divide the entire thing in blocks and you will give cursor prompts for each. take inspiration from the available dealerships websites and standout extra features that could be added. could be price comparison across sites etc etc...what do u think.

also i want all the feature codes written separately so that if we make changes in the future..introducing new code will not create bugs..kind of like a ring architecture. create a context.md file for cursor and yourself so we can refer to that for the guidelines that i am giving you. and can we use supabase? refer to the pdf i uploaded above that is the hard rules. project should follow that at every step. also can we do an mcp integration?

i also want an architecture.md explaining architecture and later a tradeoffs.md as we progress. also give me a rough flow on the blocks and how we will procede. then give me content to put in context.md and cursor rules. and then we will make a read me. then we start block 1 wih you giving me cursor prompts. we dont have much time just a day to finish this so chop chop. act as a senior software engineer and tell me if there are better decisions or ways to go about this and where im wrong. design this from  a senior software perspective and focus is on writing clean and understandable code not some overly complex bs.

i want the black text higher..and grey text lower so it is visible...like make things visible and no text should overrise anything whatsoever

Block 1, step 1.1 — project setup. No tests and no app code in this step.
Read context.md and architecture.md first.

The database is Supabase-hosted PostgreSQL, reached through the Session pooler, in one project with two schemas: dev and test. There is no Docker in this project.

1. Create backend/ as an npm project: TypeScript strict mode, ESM ("type": "module"), tsx for running in dev, tsc for the build.
2. Install dependencies:
   - runtime: express@5, cors, @prisma/client@6, zod, bcrypt, jsonwebtoken, dotenv
   - dev: typescript, tsx, prisma@6, vitest, @vitest/coverage-v8, supertest, @types/node, @types/express, @types/cors, @types/supertest, @types/bcrypt, @types/jsonwebtoken, eslint, typescript-eslint, prettier
3. Create backend/.env.example with:
   DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?schema=dev
   PORT=4000
   JWT_SECRET=change-me
   JWT_EXPIRES_IN=1h
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=change-me-too
   CORS_ORIGIN=http://localhost:5173
4. Create backend/.env.test.example: the same keys, with DATABASE_URL ending in ?schema=test and JWT_EXPIRES_IN=15m.
5. Copy both examples to backend/.env and backend/.env.test, but leave the placeholder values. I will paste the real connection strings myself. Make sure .gitignore ignores .env and .env.test but NOT the .example files.
6. Create backend/prisma/schema.prisma: postgresql datasource from env DATABASE_URL, the prisma-client-js generator, and no models yet. Do not add directUrl; the Session pooler handles migrations.
7. Create backend/src/shared/config.ts: loadConfig() reads the env vars above, validates them with Zod, and throws one clear error listing every missing or invalid variable. Export the Config type.
8. Create backend/vitest.config.ts:
   - environment node;
   - load .env.test;
   - setupFiles: tests/setup.ts;
   - globalSetup: tests/global-setup.ts;
   - fileParallelism: false, because all integration tests share one schema;
   - testTimeout: 20000, because the database is remote;
   - coverage with the v8 provider over src/**, excluding src/server.ts.
9. Create backend/tests/setup.ts: if DATABASE_URL does not contain "schema=test", throw "Refusing to run tests against a non-test database".
10. Create backend/tests/global-setup.ts: applies the same guard, then runs "prisma migrate deploy" with the test env, so migrations reach the test schema before the suite.
11. Add package.json scripts:
    - dev (tsx watch src/server.ts), build, start, typecheck (tsc --noEmit), lint, format
    - test (vitest run), test:watch, test:coverage
    - db:migrate (prisma migrate dev, using .env), db:test:migrate (prisma migrate deploy, using .env.test), db:seed
12. Add an ESLint flat config using typescript-eslint recommended, and a minimal .prettierrc.

Do NOT create src/app.ts, src/server.ts or any tests.

Then run these and show the output:
- npm install
- npx prisma validate
- npm run typecheck
- npm run lint

Stop and propose a commit message. Remind me to paste the real DATABASE_URL values into backend/.env and backend/.env.test.

Block 1, step 1.2 — RED. Write tests only. Do not create or change anything under backend/src/.
Read context.md and architecture.md first.

Context: backend/ is already scaffolded (step 1.1). Vitest loads .env.test, tests/setup.ts exports assertTestDatabase(), and tests/global-setup.ts runs prisma migrate deploy against the Supabase test schema.

1. Create backend/tests/helpers/createTestApp.ts. It exports createTestApp(), which:
   - calls loadConfig() from src/shared/config.ts;
   - calls createPrismaClient(config.DATABASE_URL) from src/shared/db.ts (does not exist yet);
   - calls createApp({ prisma, config }) from src/app.ts (does not exist yet);
   - returns { app, prisma }, so test files can call prisma.$disconnect() in afterAll.

2. Create backend/tests/app.test.ts (integration, Supertest). Use createTestApp() in beforeAll and prisma.$disconnect() in afterAll. Cases:
   a. GET /api/health returns 200 with body exactly { status: "ok" }.
   b. GET /api/does-not-exist returns 404 with body { error: { code: "NOT_FOUND", message: <any non-empty string> } }.
   c. POST /api/health with header Content-Type: application/json and the raw malformed body {"bad": returns 400 with error.code "INVALID_JSON".

3. Create backend/src/shared/http/__tests__/errorHandler.test.ts (unit). Use a mocked res whose status() and json() are vi.fn() and chainable, a mocked next as vi.fn(), and an empty req. Silence console.error with vi.spyOn(console, "error").mockImplementation(() => {}), and restore it after each test. Cases:
   a. new NotFoundError("Vehicle not found") gives res.status(404) and res.json({ error: { code: "NOT_FOUND", message: "Vehicle not found" } }).
   b. A ConflictError created with code "OUT_OF_STOCK" gives res.status(409) and error.code "OUT_OF_STOCK".
   c. new Error("db password leaked") gives res.status(500), error.code "INTERNAL_ERROR", a message that does NOT contain "db password leaked", and console.error called once.
   d. If res.headersSent is true, the handler calls next(err) and does not call res.status().

   Import the error classes from src/shared/errors.ts and the handler from src/shared/http/errorHandler.ts. Neither exists yet; that is expected.

The test files live in backend/src/shared/http/__tests__/ (the folder test above) and backend/tests/ (the integration test and the helper). Do not create the modules they import.

Run npm test and show the output. It should fail because those modules don't exist yet; that is the expected red state.
If instead it fails earlier, while connecting to the database in global-setup, stop and show me that error. That is a setup problem, not the red state.

Stop and propose a commit message starting with "test:".

Block 1, step 1.3 — GREEN. Write the least code that makes every test pass. Do not edit or delete any test.
Read context.md and architecture.md first.

1. backend/src/shared/errors.ts
   - AppError extends Error, with readonly status: number and readonly code: string. Set this.name to the class name.
   - Subclasses, each with a default code, and a constructor taking (message, code?) so the code can be overridden:
     - ValidationError: 400, VALIDATION_ERROR
     - UnauthorizedError: 401, UNAUTHORIZED
     - ForbiddenError: 403, FORBIDDEN
     - NotFoundError: 404, NOT_FOUND
     - ConflictError: 409, CONFLICT
   - One short doc comment on AppError explaining that services throw these and errorHandler maps them to HTTP.

2. backend/src/shared/http/errorHandler.ts, an Express error middleware with four arguments: (err, req, res, next).
   - If res.headersSent: call next(err) and return.
   - AppError: res.status(err.status).json({ error: { code: err.code, message: err.message } }).
   - The body-parser JSON error (an object with type === "entity.parse.failed"): 400 with code INVALID_JSON and message "Request body is not valid JSON".
   - Anything else: console.error(err), then 500 with code INTERNAL_ERROR and message "Something went wrong". Never send the original message.
   - Name unused parameters with a leading underscore. If lint flags them, add argsIgnorePattern "^_" to the no-unused-vars rule in eslint.config.js. That is the only config change allowed.

3. backend/src/shared/http/notFound.ts: middleware that sends 404 { error: { code: "NOT_FOUND", message: "Route not found" } }.

4. backend/src/shared/db.ts: createPrismaClient(databaseUrl) returns new PrismaClient({ datasourceUrl: databaseUrl }).

5. backend/src/app.ts
   - Export the AppDeps type ({ prisma: PrismaClient; config: Config }) and createApp(deps), which returns the Express app WITHOUT calling listen().
   - Middleware order: cors({ origin: config.CORS_ORIGIN }), express.json(), GET /api/health returning { status: "ok" }, notFound, errorHandler.
   - One comment: Express 5 forwards rejected promises to errorHandler, so routes need no try/catch.
   - prisma is unused for now. Keep it in AppDeps; modules will use it from Block 2.

6. backend/src/server.ts: loadConfig(), createPrismaClient(config.DATABASE_URL), createApp(), app.listen(config.PORT), then log "API listening on http://localhost:<PORT>".

If importing PrismaClient fails because the client hasn't been generated, run npx prisma generate once and continue.

Then run these and show the output:
- npm test
- npm run typecheck
- npm run lint
- npm run dev, then in a second terminal curl http://localhost:4000/api/health. Show the response, then stop the server.

Stop and propose a commit message starting with "feat:".