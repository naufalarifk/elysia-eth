import { EthereumService } from '../services/ethereumService';

export const ethereumController = {
  getBalance: async ({ params }: { params: { address: string } }) => {
    return await EthereumService.getBalance(params.address);
  },

  sendTransaction: async ({ body }: { body: { to: string; amount: string } }) => {
    return await EthereumService.sendTransaction(body.to, body.amount);
  },

  getTransaction: async ({ params }: { params: { hash: string } }) => {
    return await EthereumService.getTransaction(params.hash);
  },

  getBlockNumber: async () => {
    return await EthereumService.getBlockNumber();
  },

  getGasPrice: async () => {
    return await EthereumService.getGasPrice();
  }
};
