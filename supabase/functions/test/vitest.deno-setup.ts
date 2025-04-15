// vitest.deno-setup.ts
import { vi } from 'vitest';

// Mock Deno global
globalThis.Deno = {
  env: {
    get: vi.fn((key) => {
      // Mock environment variables
      const envVars = {
        RESEND_API_KEY: 'mock-api-key',
        AWS_REGION: 'us-east-1',
        AWS_ACCESS_KEY_ID: 'test-access-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret-key',
      };
      return envVars[key];
    }),
    set: vi.fn(),
  },
  // Add other Deno APIs you need to mock
} as any;