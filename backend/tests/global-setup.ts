import { execSync } from 'node:child_process';
import { assertTestDatabase } from './setup.js';

/** Runs once before the suite, so the test schema always has the latest migrations. */
export default function globalSetup(): void {
  assertTestDatabase();
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });
}
