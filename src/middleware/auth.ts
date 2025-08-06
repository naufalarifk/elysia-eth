import { Elysia } from 'elysia';
import * as dotenv from 'dotenv';
import { jwt } from '@elysiajs/jwt';
import { bearer } from '@elysiajs/bearer';


dotenv.config({ path: './src/.env' });


export const authMiddleware = (app: Elysia) => {
  return app
    .use(jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'your-secret-key',
      exp: '7d'
    }))
    .use(bearer())
      .derive(async ({ bearer, jwt }) => {
    
      if (!bearer) return { user: null };

      const payload = await jwt.verify(bearer);
      if (!payload) return { user: null };

      return {
        user: payload
      };
    });
};

export const isAuthenticated = (app: Elysia) => {
  return app
    .use(authMiddleware)
    .derive(async ({ user }) => {
      if (!user) {
        throw new Error('Unauthorized');
      }
      return { user };
    });
};
