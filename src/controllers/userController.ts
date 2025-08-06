import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { users } from '../db/schema/users';

export const userController = {
  getAllUsers: async ({ user }: { user: any }) => {
    try {
      if (!user) {
        return {
          status: 401,
          error: "Unauthorized"
        };
      }

      const allUsers = await db.select().from(users);
      return {
        status: 200,
        data: allUsers
      };
    } catch (error) {
      return {
        status: 500,
        error: "Failed to fetch users"
      };
    }
  },

  getUserById: async ({ id, user }: { id: string; user: any }) => {
    try {
      if (!user) {
        return {
          status: 401,
          error: "Unauthorized"
        };
      }

      const foundUser = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);
      if (!foundUser.length) {
        return {
          status: 404,
          error: "User not found"
        };
      }
      return {
        status: 200,
        data: foundUser[0]
      };
    } catch (error) {
      return {
        status: 500,
        error: "Failed to fetch user"
      };
    }
  },

  createUser: async ({ body, user }: { body: { name: string; email: string; password: string }; user: any }) => {
    try {
      if (!user) {
        return {
          status: 401,
          error: "Unauthorized"
        };
      }

      const newUser = await db.insert(users).values({ ...body, createdAt: new Date(), updatedAt: new Date() }).returning();
      return {
        status: 201,
        data: newUser[0]
      };
    } catch (error) {
      return {
        status: 500,
        error: "Failed to create user"
      };
    }
  },

  updateUser: async ({ id, body, user }: { id: string; body: Partial<{ name: string; email: string }>; user: any }) => {
    try {
      if (!user) {
        return {
          status: 401,
          error: "Unauthorized"
        };
      }

      const updatedUser = await db
        .update(users)
        .set({ ...body, updatedAt: new Date() })
        .where(eq(users.id, parseInt(id)))
        .returning();

      if (!updatedUser.length) {
        return {
          status: 404,
          error: "User not found"
        };
      }

      return {
        status: 200,
        data: updatedUser[0]
      };
    } catch (error) {
      return {
        status: 500,
        error: "Failed to update user"
      };
    }
  },

  deleteUser: async ({ id, user }: { id: string; user: any }) => {
    try {
      if (!user) {
        return {
          status: 401,
          error: "Unauthorized"
        };
      }

      const deletedUser = await db
        .delete(users)
        .where(eq(users.id, parseInt(id)))
        .returning();

      if (!deletedUser.length) {
        return {
          status: 404,
          error: "User not found"
        };
      }

      return {
        status: 200,
        message: "User deleted successfully"
      };
    } catch (error) {
      return {
        status: 500,
        error: "Failed to delete user"
      };
    }
  }
};
