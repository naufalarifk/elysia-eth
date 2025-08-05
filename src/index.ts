import { Elysia } from "elysia";
import { swagger } from '@elysiajs/swagger';
import * as dotenv from 'dotenv';
import { userRoutes } from "./routes/userRoutes";
import { healthRoutes } from "./routes/healthRoutes";
import { ethereumRoutes } from "./routes/ethereumRoutes";

dotenv.config({ path: './src/.env' });

const app = new Elysia()
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'Blockchain API Documentation',
        version: '1.0.0',
        description: 'API for interacting with Ethereum blockchain and user management',
      },
      tags: [
        { name: 'Health', description: 'Health check endpoints' },
        { name: 'Users', description: 'User management endpoints' },
        { name: 'Ethereum', description: 'Ethereum blockchain interaction endpoints' },
      ]
    }
  }))
  .get("/", () => ({
    message: "Welcome to the API",
    version: "1.0.0"
  }), {
    detail: {
      tags: ['General']
    }
  });

healthRoutes(app);
userRoutes(app);
ethereumRoutes(app);

app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
