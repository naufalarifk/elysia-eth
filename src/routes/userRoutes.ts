import { Elysia, t } from 'elysia';
import { userController } from '../controllers/userController';

export const userRoutes = (app: Elysia) => {
  return app
    .group('/users', app => app
      // Get all users
      .get('/', async () => await userController.getAllUsers())
      
      // Get user by ID
      .get('/:id', async ({ params: { id } }) => await userController.getUserById({ id }))
      
      // Create new user
      .post('/', async ({ body }) => await userController.createUser({ body }), {
        body: t.Object({
          name: t.String(),
          email: t.String()
        })
      })
      
      // Update user
      .put('/:id', async ({ params: { id }, body }) => await userController.updateUser({ 
        id, 
        body
      }), {
        body: t.Object({
          name: t.Optional(t.String()),
          email: t.Optional(t.String())
        })
      })
      
      // Delete user
      .delete('/:id', async ({ params: { id } }) => await userController.deleteUser({ id }))
    );
};
