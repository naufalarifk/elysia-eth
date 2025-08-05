import { userController } from '../../controllers/userController';
import { db } from '../../config/database';
import { users } from '../../db/schema/users';

// Mock the database module
jest.mock('../../config/database', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('UserController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      const mockUsers = [
        { id: 1, name: 'Test User', email: 'test@example.com' },
        { id: 2, name: 'Test User 2', email: 'test2@example.com' },
      ];

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockResolvedValue(mockUsers),
      });

      const result = await userController.getAllUsers();

      expect(result).toEqual({
        status: 200,
        data: mockUsers,
      });
      expect(db.select).toHaveBeenCalled();
    });

    it('should handle errors when fetching users', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      const result = await userController.getAllUsers();

      expect(result).toEqual({
        status: 500,
        error: 'Failed to fetch users',
      });
    });
  });

  describe('getUserById', () => {
    it('should return a user by id successfully', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const result = await userController.getUserById({ id: '1' });

      expect(result).toEqual({
        status: 200,
        data: mockUser,
      });
    });

    it('should return 404 when user is not found', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await userController.getUserById({ id: '999' });

      expect(result).toEqual({
        status: 404,
        error: 'User not found',
      });
    });
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };
      const createUserData = { name: 'Test User', email: 'test@example.com' };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockUser]),
        }),
      });

      const result = await userController.createUser({ body: createUserData });

      expect(result).toEqual({
        status: 201,
        data: mockUser,
      });
    });

    it('should handle errors during user creation', async () => {
      const createUserData = { name: 'Test User', email: 'test@example.com' };

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      const result = await userController.createUser({ body: createUserData });

      expect(result).toEqual({
        status: 500,
        error: 'Failed to create user',
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user successfully', async () => {
      const mockUser = { id: 1, name: 'Updated User', email: 'test@example.com' };
      const updateData = { name: 'Updated User' };

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      });

      const result = await userController.updateUser({ id: '1', body: updateData });

      expect(result).toEqual({
        status: 200,
        data: mockUser,
      });
    });

    it('should return 404 when updating non-existent user', async () => {
      const updateData = { name: 'Updated User' };

      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await userController.updateUser({ id: '999', body: updateData });

      expect(result).toEqual({
        status: 404,
        error: 'User not found',
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };

      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockUser]),
        }),
      });

        const result = await userController.deleteUser({ id: '1' });
        
        console.log('result', result)

      expect(result).toEqual({
        status: 200,
        message: 'User deleted successfully',
      });
    });

    it('should return 404 when deleting non-existent user', async () => {
      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await userController.deleteUser({ id: '999' });

      expect(result).toEqual({
        status: 404,
        error: 'User not found',
      });
    });
  });
});
