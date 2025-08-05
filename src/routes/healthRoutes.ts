import { Elysia, t } from 'elysia';

export const healthRoutes = (app: Elysia) => {
  return app
    .group('/health', app => app
      .get('/', () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }), {
        detail: {
          tags: ['Health'],
          description: 'Get API health status',
          responses: {
            200: {
              description: 'Success response with health status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string' },
                      timestamp: { type: 'string' },
                      uptime: { type: 'number' }
                    },
                    required: ['status', 'timestamp', 'uptime']
                  }
                }
              }
            }
          }
        }
      })
    );
};
