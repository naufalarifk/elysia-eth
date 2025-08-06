import { describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";
import { userController } from '../../controllers/userController';

describe('UserController', () => {
  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      const app = new Elysia();
      const mockUsers = [
        { id: 1, name: 'Test User', email: 'test@example.com' },
        { id: 2, name: 'Test User 2', email: 'test2@example.com' }
      ];
      const mockDb = {
        select: mock(() => ({
          from: () => Promise.resolve(mockUsers)
        }))
      };

      app.derive(() => ({ db: mockDb }))
        .get('/users', userController.getAllUsers);

      const response = await app.handle(new Request('http://localhost/users'));
      const result = await response.json();
      
      expect(result).toEqual({
        status: 200,
        data: mockUsers
      });
    });

    it('should handle errors when fetching users', async () => {
      const app = new Elysia();
      const mockDb = {
        select: mock(() => ({
          from: () => Promise.reject(new Error('Database error'))
        }))
      };

      app.derive(() => ({ db: mockDb }))
        .get('/users', userController.getAllUsers);

      const response = await app.handle(new Request('http://localhost/users'));
      const result = await response.json();
      
      expect(result).toEqual({
        status: 500,
        error: 'Failed to fetch users'
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by id successfully', async () => {
      const app = new Elysia();
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      const mockDb = {
        select: mock(() => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([mockUser])
            })
          })
        }))
      };

      app.derive(() => ({ db: mockDb }))
        .get('/users/:id', userController.getUserById);

      const response = await app.handle(new Request('http://localhost/users/1'));
      const result = await response.json();
      
      expect(result).toEqual({
        status: 200,
        data: mockUser
      });
    });

    it('should return 404 when user not found', async () => {
      const app = new Elysia();
      const mockDb = {
        select: mock(() => ({
          from: () => ({
            where: () => ({
              limit: () => Promise.resolve([])
            })
          })
        }))
      };

      app.derive(() => ({ db: mockDb }))
        .get('/users/:id', userController.getUserById);

      const response = await app.handle(new Request('http://localhost/users/999'));
      const result = await response.json();
      
      expect(result).toEqual({
        status: 404,
        error: 'User not found'
      });
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const app = new Elysia();
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      const createUserData = { name: 'Test User', email: 'test@example.com' };
      const mockDb = {
        insert: mock(() => ({
          values: () => ({
            returning: () => Promise.resolve([mockUser])
          })
        }))
      };

      app.derive(() => ({ db: mockDb }))
        .post('/users', userController.createUser);

      const response = await app.handle(
        new Request('http://localhost/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createUserData)
        })
      );
      const result = await response.json();
      
      expect(result).toEqual({
        status: 201,
        data: mockUser
      });
    });

    it('should handle errors during user creation', async () => {
      const app = new Elysia();
      const createUserData = { name: 'Test User', email: 'test@example.com' };
      const mockDb = {
        insert: mock(() => ({
          values: () => ({
            returning: () => Promise.reject(new Error('Database error'))
          })
        }))
      };

      app.derive(() => ({ db: mockDb }))
        .post('/users', userController.createUser);

      const response = await app.handle(
        new Request('http://localhost/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createUserData)
        })
      );
      const result = await response.json();
      
      expect(result).toEqual({
        status: 500,
        error: 'Failed to create user'
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const app = new Elysia();
      const mockUser = { id: 1, name: 'Updated User', email: 'test@example.com' };
      const updateData = { name: 'Updated User' };
      const mockDb = {
        update: mock(() => ({
          set: () => ({
            where: () => ({
              returning: () => Promise.resolve([mockUser])
            })
          })
        }))
      };

      app.derive(() => ({ db: mockDb }))
        .put('/users/:id', userController.updateUser);

      const response = await app.handle(
        new Request('http://localhost/users/1', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
      );
      const result = await response.json();
      
      expect(result).toEqual({
        status: 200,
        data: mockUser
      });
    });

    it('should return 404 when updating non-existent user', async () => {
      const app = new Elysia();
      const updateData = { name: 'Updated User' };
      const mockDb = {
        update: mock(() => ({
          set: () => ({
            where: () => ({
              returning: () => Promise.resolve([])
            })
          })
        }))
      };

      app.derive(() => ({ db: mockDb }))
        .put('/users/:id', userController.updateUser);

      const response = await app.handle(
        new Request('http://localhost/users/999', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
      );
      const result = await response.json();
      
      expect(result).toEqual({
        status: 404,
        error: 'User not found'
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const app = new Elysia();
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
      const mockDb = {
        delete: mock(() => ({
          where: () => ({
            returning: () => Promise.resolve([mockUser])
          })
        }))
      };

      app.derive(() => ({ db: mockDb }))
        .delete('/users/:id', userController.deleteUser);

      const response = await app.handle(
        new Request('http://localhost/users/1', {
          method: 'DELETE'
        })
      );
      const result = await response.json();
      
      expect(result).toEqual({
        status: 200,
        message: 'User deleted successfully'
      });
    });

    it('should return 404 when deleting non-existent user', async () => {
      const app = new Elysia();
      const mockDb = {
        delete: mock(() => ({
          where: () => ({
            returning: () => Promise.resolve([])
          })
        }))
      };

      app.derive(() => ({ db: mockDb }))
        .delete('/users/:id', userController.deleteUser);

      const response = await app.handle(
        new Request('http://localhost/users/999', {
          method: 'DELETE'
        })
      );
      const result = await response.json();
      
      expect(result).toEqual({
        status: 404,
        error: 'User not found'
      });
    });
  });
});
