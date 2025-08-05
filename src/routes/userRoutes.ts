import { Elysia, t } from 'elysia';
import { userController } from '../controllers/userController';

export const userRoutes = (app: Elysia) => {
  return app
    .group('/users', app => app
      .get('/', async () => await userController.getAllUsers())
      
      .get('/:id', async ({ params: { id } }) => await userController.getUserById({ id }))
      
      .post('/', async ({ body }) => await userController.createUser({ body }), {
        body: t.Object({
          name: t.String(),
          email: t.String()
        })
      })
      
      .put('/:id', async ({ params: { id }, body }) => await userController.updateUser({ 
        id, 
        body
      }), {
        body: t.Object({
          name: t.Optional(t.String()),
          email: t.Optional(t.String())
        })
      })
      
      .delete('/:id', async ({ params: { id } }) => await userController.deleteUser({ id }))
    );
};
