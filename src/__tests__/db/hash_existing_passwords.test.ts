import { describe, expect, it, mock, spyOn } from "bun:test";
import * as bcrypt from '@node-rs/bcrypt';
import { db } from '../../config/database';
import { users } from '../../db/schema/users';
import { hashExistingPasswords } from '../../db/migrations/hash_existing_passwords';

describe('Password Hashing Migration', () => {
  describe('hashExistingPasswords', () => {
    it('should hash default passwords for all users', async () => {
      const hashedPassword = 'hashed-password-123';
      
      mock.module('@node-rs/bcrypt', () => ({ 
        hash: mock(() => Promise.resolve(hashedPassword))
      }));

      const selectMock = mock(() => ({
        from: () => Promise.resolve([
          { id: 1, password: 'changeme' },
          { id: 2, password: 'changeme' },
          { id: 3, password: 'already-hashed' }
        ])
      }));

      const updateMock = mock(() => ({
        set: () => ({
          where: () => Promise.resolve([{ id: 1 }])
        })
      }));

      mock.module('../../config/database', () => ({
        db: { select: selectMock, update: updateMock }
      }));

      await hashExistingPasswords();

      // We expect update to be called twice - once for each 'changeme' password
      expect(updateMock).toHaveBeenCalledTimes(2);
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      const errorSpy = spyOn(console, 'error');
      
      mock.module('../../config/database', () => ({
        db: {
          select: mock(() => ({
            from: () => Promise.reject(mockError)
          }))
        }
      }));

      await expect(hashExistingPasswords()).rejects.toThrow(mockError);
      expect(errorSpy).toHaveBeenCalledWith('Error hashing passwords:', mockError);
    });

    it('should skip users with non-default passwords', async () => {
      const selectMock = mock(() => ({
        from: () => Promise.resolve([
          { id: 1, password: 'already-hashed-1' },
          { id: 2, password: 'already-hashed-2' }
        ])
      }));

      const updateMock = mock(() => ({
        set: () => ({
          where: () => Promise.resolve([{ id: 1 }])
        })
      }));

      mock.module('../../config/database', () => ({
        db: { select: selectMock, update: updateMock }
      }));

      await hashExistingPasswords();

      // Verify that no updates were performed since no passwords were 'changeme'
      expect(updateMock).toHaveBeenCalledTimes(0);
    });
  });
});

