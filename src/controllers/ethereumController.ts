import { EthereumService } from '../services/ethereumService';

export const ethereumController = {
  // Get balance
  getBalance: async ({ params }: { params: { address: string } }) => {
    return await EthereumService.getBalance(params.address);
  },

  // Send transaction
  sendTransaction: async ({ body }: { body: { to: string; amount: string } }) => {
    return await EthereumService.sendTransaction(body.to, body.amount);
  },

  // Get transaction details
  getTransaction: async ({ params }: { params: { hash: string } }) => {
    return await EthereumService.getTransaction(params.hash);
  },

  // Get block number
  getBlockNumber: async () => {
    return await EthereumService.getBlockNumber();
  },

  // Get gas price
  getGasPrice: async () => {
    return await EthereumService.getGasPrice();
  }
};
