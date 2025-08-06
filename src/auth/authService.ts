import * as bcrypt from '@node-rs/bcrypt';
import { db } from '../config/database';
import { users } from '../db/schema/users';
import { eq } from 'drizzle-orm';
import { User } from '../types/user';

export class AuthService {
  private static jwt: (payload: any) => Promise<string>;

  static setJWT(jwtSign: (payload: any) => Promise<string>) {
    this.jwt = jwtSign;
  }
  static async login(email: string, password: string) {
    try {
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (!user.length) {
        return {
          status: 401,
          error: 'Invalid credentials'
        };
      }

      const passwordMatch = await bcrypt.compare(password, user[0].password);
      if (!passwordMatch) {
        return {
          status: 401,
          error: 'Invalid credentials'
        };
      }

      const { password: _, ...userWithoutPassword } = user[0];
      
      if (!AuthService.jwt) {
        throw new Error('JWT service not initialized');
      }

      const token = await AuthService.jwt(userWithoutPassword);
      
      return {
        status: 200,
        data: {
          user: userWithoutPassword,
          token
        }
      };
    } catch (error) {
      return {
        status: 500,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  static async register(data: { name: string; email: string; password: string }) {
    try {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (existingUser.length) {
        return {
          status: 409,
          error: 'Email already registered'
        };
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const newUser = await db
        .insert(users)
        .values({
          ...data,
          password: hashedPassword
        })
        .returning();

      const { password: _, ...userWithoutPassword } = newUser[0];
      return {
        status: 201,
          data: {
            message: 'User created successfully',
        }
      };
    } catch (error) {
      return {
        status: 500,
        error: 'Registration failed'
      };
    }
  }
}
