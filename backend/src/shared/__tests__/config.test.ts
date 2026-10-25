import { describe, expect, it } from 'vitest';
import { loadConfig } from '../config.js';

describe('loadConfig', () => {
  it('parses a comma-separated CORS_ORIGIN into trimmed origins', () => {
    const config = loadConfig({ ...process.env, CORS_ORIGIN: 'a, b' });

    expect(config.CORS_ORIGIN).toEqual(['a', 'b']);
  });
});
