
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    mockReset: true,
    environment: 'node', // We still use node as the base, but will mock Deno globals
    include: ['**/supabase/**/*.test.{ts,js}'], // Only include Supabase function tests
    setupFiles: ['./supabase/functions/test/vitest.deno-setup.ts'], // Deno-specific setup
    alias: {
      // Map Deno-style imports to Node.js compatible imports
      'npm:@aws-sdk/client-s3': '@aws-sdk/client-s3',
      'npm:@aws-sdk/client-textract': '@aws-sdk/client-textract',
      'https://deno.land/std@0.190.0/http/server.ts': './supabase/functions/test/mocks/deno-http-server.ts',
      // Add other Deno imports you need to mock
    },
  },
});
