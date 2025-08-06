import { AuthService } from '../auth/authService';

export const authController = {
  login: async ({ body }: { body: { email: string; password: string } }) => {
    return await AuthService.login(body.email, body.password);
  },

  register: async ({ body }: { body: { name: string; email: string; password: string } }) => {
    return await AuthService.register(body);
  }
};
