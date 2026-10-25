/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The backend's CORS allows only this origin, so never fall back to another port.
  server: { port: 5173, strictPort: true },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**'],
    },
    env: {
      VITE_API_URL: 'http://localhost:4000',
      VITE_DEMO_USER_EMAIL: 'demo.customer@marque.test',
      VITE_DEMO_USER_PASSWORD: 'customer-demo-pass',
      VITE_DEMO_ADMIN_EMAIL: 'demo.admin@marque.test',
      VITE_DEMO_ADMIN_PASSWORD: 'admin-demo-pass',
    },
  },
});
