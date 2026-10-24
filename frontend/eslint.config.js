import reactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist'] },
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
);
