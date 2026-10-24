/** Tests empty tables, so they must never touch the dev schema. */
export function assertTestDatabase(): void {
  if (!process.env.DATABASE_URL?.includes('schema=test')) {
    throw new Error('Refusing to run tests against a non-test database');
  }
}

assertTestDatabase();
