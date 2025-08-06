import { describe, expect, it, mock, spyOn } from "bun:test";
import { Elysia } from "elysia";
import { authMiddleware, isAuthenticated } from "../../middleware/auth";

describe('Auth Middleware', () => {
  it('should add jwt and bearer middleware to app', () => {
    const app = new Elysia();
    const useSpy = spyOn(app, 'use');
    const deriveSpy = spyOn(app, 'derive');

    authMiddleware(app);

    expect(useSpy).toHaveBeenCalledTimes(2);
    expect(deriveSpy).toHaveBeenCalledTimes(1);
  });

  it('should return null user when no bearer token is provided', async () => {
    const app = new Elysia();
    const mockJwt = {
      verify: mock(() => Promise.resolve(null))
    };

    app.use(authMiddleware);

    const response = await app.handle(new Request('http://localhost'));
    const result = await response.json();
    expect(result.user).toBe(null);
  });

  it('should return null user when bearer token is invalid', async () => {
    const app = new Elysia();
    const mockJwt = {
      verify: mock(() => Promise.resolve(null))
    };

    app.use(authMiddleware);

    const response = await app.handle(
      new Request('http://localhost', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      })
    );
    const result = await response.json();
    expect(result.user).toBe(null);
  });

  it('should return user payload when bearer token is valid', async () => {
    const app = new Elysia();
    const mockPayload = { id: 1, email: 'test@example.com' };
    const mockJwt = {
      verify: mock(() => Promise.resolve(mockPayload))
    };

    app.use(authMiddleware);

    const response = await app.handle(
      new Request('http://localhost', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })
    );
    const result = await response.json();
    expect(result.user).toEqual(mockPayload);
  });
});

describe('isAuthenticated Middleware', () => {
  it('should throw error when user is not authenticated', async () => {
    const app = new Elysia();
    let error: Error | null = null;

    app.use(isAuthenticated);

    try {
      await app.handle(new Request('http://localhost'));
    } catch (e) {
      error = e as Error;
    }

    expect(error).toBeTruthy();
    expect(error?.message).toBe('Unauthorized');
  });

  it('should pass through when user is authenticated', async () => {
    const app = new Elysia();
    const mockUser = { id: 1, email: 'test@example.com' };

    app.derive(() => ({ user: mockUser }))
      .use(isAuthenticated);

    const response = await app.handle(new Request('http://localhost'));
    const result = await response.json();
    expect(result.user).toEqual(mockUser);
  });
});
