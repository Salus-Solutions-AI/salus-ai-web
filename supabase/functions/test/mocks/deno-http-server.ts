import { vi } from 'vitest';

// Mock the serve function from Deno's HTTP server
export const serve = vi.fn((handler) => {
  // Optional implementation if needed for testing
  return {
    shutdown: vi.fn(),
  };
});

// Mock the Server class if needed
export class Server {
  constructor() {}
  serve = vi.fn();
  close = vi.fn();
}

// Any other exports from the Deno HTTP module you need
export const Status = {
  OK: 200,
  BadRequest: 400,
  NotFound: 404,
  // etc.
};