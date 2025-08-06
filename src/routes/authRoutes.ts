import { Elysia, t } from 'elysia';
import { authController } from '../controllers/authController';
import { AuthService } from '../auth/authService';
import { jwt } from '@elysiajs/jwt';

export const authRoutes = (app: Elysia) => {
  return app
    .use(jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'your-secret-key',
      exp: '7d'
    }))
    .derive({ as: 'global' }, ({ jwt }) => {
      AuthService.setJWT(jwt.sign);
      return {};
    })
    .group('/auth', app => app
      .post('/login', async ({ body }) => await authController.login({ body }), {
        body: t.Object({
          email: t.String(),
          password: t.String()
        }),
        detail: {
          tags: ['Auth'],
          summary: 'Login user',
          description: 'Authenticate user with email and password to get a JWT token',
          responses: {
            '200': {
              description: 'Successfully authenticated',
            },
            '401': {
              description: 'Invalid credentials'
            },
            '500': {
              description: 'Internal server error'
            }
          }
        }
      })
      
      .post('/register', async ({ body }) => await authController.register({ body }), {
        body: t.Object({
          name: t.String(),
          email: t.String(),
          password: t.String()
        }),
        detail: {
          tags: ['Auth'],
          summary: 'Register new user',
          description: 'Create a new user account',
          responses: {
            '201': {
                  description: 'User successfully created',
                  content: {
                      message: {
                          schema: {
                                type: 'object',
                              example: {
                                    message: 'User created successfully'
                                }
                            }
                    }
                }
            },
            '409': {
                description: 'Email already exists',
                content: {
                    error: {
                        schema: {
                            type: 'object',
                            example: {
                                error: 'Email already exists'
                            }
                        }
                    }
                }
            },
            '500': {
                description: 'Internal server error',
                content: {
                    error: {
                        schema: {
                            type: 'object',
                            example: {
                                error: 'Failed to create user'
                            }
                        }
                    }
                }
            }
          }
        }
      })
    );
};
