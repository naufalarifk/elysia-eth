import { describe, expect, it, mock } from "bun:test";
import { ethers } from 'ethers';
import { EthereumService } from '../../services/ethereumService';

mock.module('../../config/ethereum', () => ({
  provider: {
    getBalance: mock(() => Promise.resolve(ethers.parseEther("1.0"))),
    getTransaction: mock(() => Promise.resolve({
      hash: "0xtxhash",
      from: "0x123",
      to: "0x456",
      value: ethers.parseEther("1.0"),
      blockNumber: 12345,
      confirmations: 10
    })),
    getBlockNumber: mock(() => Promise.resolve(12345)),
    getFeeData: mock(() => Promise.resolve({
      gasPrice: ethers.parseUnits("20", "gwei"),
      maxFeePerGas: null,
      maxPriorityFeePerGas: null
    }))
  },
  wallet: {
    sendTransaction: mock(() => Promise.resolve({
      hash: "0xtxhash",
      from: "0x123",
      to: "0x456",
      wait: () => Promise.resolve({})
    }))
  }
}));

describe('EthereumService', () => {
  const mockAddress = '0x123';

  describe('getBalance', () => {
    it('should return the balance successfully', async () => {
      const result = await EthereumService.getBalance(mockAddress);

      expect(result).toEqual({
        status: 200,
        data: {
          address: mockAddress,
          balance: '1.0',
          currency: 'ETH'
        }
      });
    });

    it('should handle errors when getting balance', async () => {
      mock.module('../../config/ethereum', () => ({
        provider: {
          getBalance: mock(() => Promise.reject(new Error('Failed to get balance')))
        }
      }));

      const result = await EthereumService.getBalance(mockAddress);

      expect(result).toEqual({
        status: 500,
        error: 'Failed to get balance: Failed to get balance'
      });
    });
  });

  describe('sendTransaction', () => {
    const mockTo = '0x456';
    const mockAmount = '1.0';

    it('should send transaction successfully', async () => {
      const mockTx = {
        hash: '0xtxhash',
        from: '0x123',
        to: mockTo,
        wait: () => Promise.resolve({})
      };

      mock.module('../../config/ethereum', () => ({
        wallet: {
          sendTransaction: mock(() => Promise.resolve(mockTx))
        }
      }));

      const result = await EthereumService.sendTransaction(mockTo, mockAmount);

      expect(result).toEqual({
        status: 200,
        data: {
          hash: mockTx.hash,
          from: mockTx.from,
          to: mockTx.to,
          amount: mockAmount,
          currency: 'ETH'
        }
      });
    });

    it('should handle errors when sending transaction', async () => {
      mock.module('../../config/ethereum', () => ({
        wallet: {
          sendTransaction: mock(() => Promise.reject(new Error('Transaction failed')))
        }
      }));

      const result = await EthereumService.sendTransaction(mockTo, mockAmount);

      expect(result).toEqual({
        status: 500,
        error: 'Transaction failed: Transaction failed',
      });
    });
  });

  describe('getTransaction', () => {
    const mockHash = '0xtxhash';

    it('should get transaction details successfully', async () => {

      const mockTx = {
        hash: '0xtxhash',
        from: '0x123',
        to: '0x456',
        value: ethers.parseEther('1.0'),
        blockNumber: 12345,
        confirmations: 10
      };

      mock.module('../../config/ethereum', () => ({
        provider: {
          getTransaction: mock(() => Promise.resolve(mockTx))
        }
      }));

      const result = await EthereumService.getTransaction(mockTx.hash);

      expect(result).toEqual({
        status: 200,
        data: {
          hash: mockTx.hash,
          from: mockTx.from,
          to: mockTx.to,
          amount: '1.0',
          currency: 'ETH',
          blockNumber: mockTx.blockNumber,
          confirmations: mockTx.confirmations
        }
      });
    });

    it('should handle not found transaction', async () => {
      mock.module('../../config/ethereum', () => ({
        provider: {
          getTransaction: mock(() => Promise.resolve(null))
        }
      }));

      const result = await EthereumService.getTransaction('0xinvalidhash');

      expect(result).toEqual({
        status: 404,
        error: 'Transaction not found'
      });
    });
  });

  describe('getBlockNumber', () => {
    it('should return current block number', async () => {
      const mockBlockNumber = 123456;
      mock.module('../../config/ethereum', () => ({
        provider: {
          getBlockNumber: mock(() => Promise.resolve(mockBlockNumber))
        }
      }));

      const result = await EthereumService.getBlockNumber();

      expect(result).toEqual({
        status: 200,
        data: {
          blockNumber: mockBlockNumber
        }
      });
    });

    it('should handle errors when getting block number', async () => {
      mock.module('../../config/ethereum', () => ({
        provider: {
          getBlockNumber: mock(() => Promise.reject(new Error('Failed to get block number')))
        }
      }));

      const result = await EthereumService.getBlockNumber();

      expect(result).toEqual({
        status: 500,
        error: 'Failed to get block number: Failed to get block number'
      });
    });
  });

  describe('getGasPrice', () => {
    it('should return current gas price', async () => {
      const mockFeeData = {
        gasPrice: ethers.parseUnits('20', 'gwei')
      };
      mock.module('../../config/ethereum', () => ({
        provider: {
          getFeeData: mock(() => Promise.resolve(mockFeeData))
        }
      }));

        const result = await EthereumService.getGasPrice();

      expect(result).toEqual({
        status: 200,
        data: {
          gasPrice: '20.0',
          maxFeePerGas: null,
          maxPriorityFeePerGas: null
        }
      });
    });

    it('should handle errors when getting gas price', async () => {
      mock.module('../../config/ethereum', () => ({
        provider: {
          getFeeData: mock(() => Promise.reject(new Error('Failed to get gas price')))
        }
      }));

      const result = await EthereumService.getGasPrice();

      expect(result).toEqual({
        status: 500,
        error: 'Failed to get fee data: Failed to get gas price'
      });
    });
  });
});
