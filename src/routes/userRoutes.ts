import { Elysia, t } from 'elysia';
import { userController } from '../controllers/userController';
import { isAuthenticated } from '../middleware/auth';

export const userRoutes = (app: Elysia) => {
  return app
    .group('/users', app => app
      .use(isAuthenticated)
      .get('/', async ({ user }) => await userController.getAllUsers({ user }), {
        detail: {
          tags: ['Users'],
          summary: 'Get all users',
          description: 'Retrieve a list of all users. Requires authentication.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'List of users retrieved successfully'
            },
            '401': {
              description: 'Unauthorized - Invalid or missing token'
            },
            '500': {
              description: 'Internal server error'
            }
          }
        }
      })
      
      .get('/:id', async ({ params: { id }, user }) => await userController.getUserById({ id, user }), {
        detail: {
          tags: ['Users'],
          summary: 'Get user by ID',
          description: 'Retrieve a specific user by their ID. Requires authentication.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'User ID'
            }
          ],
          responses: {
            '200': {
              description: 'User retrieved successfully'
            },
            '401': {
              description: 'Unauthorized - Invalid or missing token'
            },
            '404': {
              description: 'User not found'
            },
            '500': {
              description: 'Internal server error'
            }
          }
        }
      })
      
      .post('/', async ({ body, user }) => await userController.createUser({ body, user }), {
        body: t.Object({
          name: t.String(),
          email: t.String(),
          password: t.String()
        }),
        detail: {
          tags: ['Users'],
          summary: 'Create new user',
          description: 'Create a new user account. Requires authentication.',
          security: [{ bearerAuth: [] }],
          responses: {
            '201': {
              description: 'User created successfully'
            },
            '401': {
              description: 'Unauthorized - Invalid or missing token'
            },
            '500': {
              description: 'Internal server error'
            }
          }
        }
      })
      
      .put('/:id', async ({ params: { id }, body, user }) => await userController.updateUser({ 
        id, 
        body,
        user
      }), {
        body: t.Object({
          name: t.Optional(t.String()),
          email: t.Optional(t.String())
        }),
        detail: {
          tags: ['Users'],
          summary: 'Update user',
          description: 'Update an existing user\'s information. Requires authentication.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'User ID'
            }
          ],
          responses: {
            '200': {
              description: 'User updated successfully'
            },
            '401': {
              description: 'Unauthorized - Invalid or missing token'
            },
            '404': {
              description: 'User not found'
            },
            '500': {
              description: 'Internal server error'
            }
          }
        }
      })
      
      .delete('/:id', async ({ params: { id }, user }) => await userController.deleteUser({ id, user }), {
        detail: {
          tags: ['Users'],
          summary: 'Delete user',
          description: 'Delete a user account. Requires authentication.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'User ID'
            }
          ],
          responses: {
            '200': {
              description: 'User deleted successfully'
            },
            '401': {
              description: 'Unauthorized - Invalid or missing token'
            },
            '404': {
              description: 'User not found'
            },
            '500': {
              description: 'Internal server error'
            }
          }
        }
      })
    );
};
