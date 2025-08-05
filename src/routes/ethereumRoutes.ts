import { Elysia, t } from 'elysia';
import { ethereumController } from '../controllers/ethereumController';

const ethereumResponses = {
  500: {
    description: 'Internal server error or blockchain interaction failed'
  }
};

export const ethereumRoutes = (app: Elysia) => {
  return app
    .group('/ethereum', app => app
      // Get ETH balance
      .get('/balance/:address', async ({ params }) => await ethereumController.getBalance({ params }), {
        params: t.Object({
          address: t.String({ description: 'Ethereum address to check balance for' })
        }),
        detail: {
          tags: ['Ethereum'],
          summary: 'Get ETH Balance',
          description: 'Retrieve the ETH balance for a specific Ethereum address',
        }
      })
      
      // Send ETH
      .post('/send', async ({ body }) => await ethereumController.sendTransaction({ body }), {
        body: t.Object({
          to: t.String({ description: 'Recipient Ethereum address' }),
          amount: t.String({ description: 'Amount of ETH to send' })
        }),
        detail: {
          tags: ['Ethereum'],
          summary: 'Send ETH',
          description: 'Send ETH from your wallet to another address'
        }
      })
      
      // Get transaction details
      .get('/tx/:hash', async ({ params }) => await ethereumController.getTransaction({ params }), {
        params: t.Object({
          hash: t.String({ description: 'Transaction hash to lookup' })
        }),
        detail: {
          tags: ['Ethereum'],
          summary: 'Get Transaction Details',
          description: 'Retrieve details about a specific Ethereum transaction'
        }
      })
      
      // Get latest block number
      .get('/block/latest', async () => await ethereumController.getBlockNumber(), {
        detail: {
          tags: ['Ethereum'],
          summary: 'Get Latest Block',
          description: 'Get the latest Ethereum block number'
        }
      })
      
      // Get gas price
      .get('/gas-price', async () => await ethereumController.getGasPrice(), {
        detail: {
          tags: ['Ethereum'],
          summary: 'Get Gas Price',
          description: 'Get current gas price information'
        }
      })
    );
};
