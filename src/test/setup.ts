import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('VITE_LASTFM_API_KEY', 'test-api-key');

const originalConsole = console;
Object.defineProperty(globalThis, 'console', {
  value: {
    ...originalConsole,
    error: vi.fn(),
    warn: vi.fn(),
  },
  writable: true,
  configurable: true,
});

