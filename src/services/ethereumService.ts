import { ethers } from 'ethers';
import { provider, wallet } from '../config/ethereum';

type ServiceResponse<T> = {
  status: number;
  data?: T;
  error?: string;
};

export class EthereumService {
  private static handleError(error: unknown, context: string): ServiceResponse<never> {
    let message = 'Unknown error occurred';
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String(error.message);
    }

    return {
      status: 500,
      error: `${context}: ${message}`
    };
  }

  // Get ETH balance for an address
  static async getBalance(address: string): Promise<ServiceResponse<{
    address: string;
    balance: string;
    currency: string;
  }>> {
    try {
      const balance = await provider.getBalance(address);
      return {
        status: 200,
        data: {
          address,
          balance: ethers.formatEther(balance),
          currency: 'ETH'
        }
      };
    } catch (error: unknown) {
      return this.handleError(error, 'Failed to get balance');
    }
  }

  // Send ETH to an address
  static async sendTransaction(to: string, amount: string): Promise<ServiceResponse<{
    hash: string;
    from: string;
    to: string;
    amount: string;
    currency: string;
  }>> {
      try {
        if (!wallet) {
            return {
            status: 500,
            error: 'Wallet is not configured'
            };
        }
      const tx = await wallet.sendTransaction({
        to,
        value: ethers.parseEther(amount)
      });

      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error('Transaction failed');
      }

      return {
        status: 200,
        data: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to ?? '',
          amount,
          currency: 'ETH'
        }
      };
    } catch (error: unknown) {
      return this.handleError(error, 'Transaction failed');
    }
  }

  // Get transaction details
  static async getTransaction(hash: string): Promise<ServiceResponse<{
    hash: string;
    from: string;
    to: string;
    amount: string;
    currency: string;
    blockNumber: number | null;
    confirmations: number;
  }>> {
    try {
      const tx = await provider.getTransaction(hash);
      if (!tx) {
        return {
          status: 404,
          error: 'Transaction not found'
        };
      }

      const confirmations = await tx.confirmations?.();

      return {
        status: 200,
        data: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to ?? '',
          amount: ethers.formatEther(tx.value),
          currency: 'ETH',
          blockNumber: tx.blockNumber,
          confirmations: confirmations ?? 0
        }
      };
    } catch (error: unknown) {
      return this.handleError(error, 'Failed to get transaction');
    }
  }

  // Get latest block number
  static async getBlockNumber(): Promise<ServiceResponse<{
    blockNumber: number;
  }>> {
    try {
      const blockNumber = await provider.getBlockNumber();
      return {
        status: 200,
        data: {
          blockNumber
        }
      };
    } catch (error: unknown) {
      return this.handleError(error, 'Failed to get block number');
    }
  }

  // Get gas price
  static async getGasPrice(): Promise<ServiceResponse<{
    gasPrice: string;
    maxFeePerGas: string | null;
    maxPriorityFeePerGas: string | null;
  }>> {
    try {
      const gasPrice = await provider.getFeeData();
      return {
        status: 200,
        data: {
          gasPrice: ethers.formatUnits(gasPrice.gasPrice ?? 0n, 'gwei'),
          maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : null,
          maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') : null
        }
      };
    } catch (error: unknown) {
      return this.handleError(error, 'Failed to get gas price');
    }
  }
}
