import { ethers } from 'ethers';
import { EthereumService } from '../../services/ethereumService';
import { provider, wallet } from '../../config/ethereum';

jest.mock('../../config/ethereum', () => ({
  provider: {
    getBalance: jest.fn(),
    getTransaction: jest.fn(),
    getBlockNumber: jest.fn(),
    getFeeData: jest.fn(),
  },
  wallet: {
    sendTransaction: jest.fn(),
  },
}));

describe('EthereumService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    const mockAddress = '0x123';

    it('should return the balance successfully', async () => {
      const mockBalance = ethers.parseEther('1.0');
      (provider.getBalance as jest.Mock).mockResolvedValue(mockBalance);

      const result = await EthereumService.getBalance(mockAddress);

      expect(result).toEqual({
        status: 200,
        data: {
          address: mockAddress,
          balance: '1.0',
          currency: 'ETH',
        },
      });
      expect(provider.getBalance).toHaveBeenCalledWith(mockAddress);
    });

    it('should handle errors when getting balance', async () => {
      (provider.getBalance as jest.Mock).mockRejectedValue(new Error('Failed to get balance'));

      const result = await EthereumService.getBalance(mockAddress);

      expect(result).toEqual({
        status: 500,
        error: 'Failed to get balance: Failed to get balance',
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
        wait: jest.fn().mockResolvedValue({}),
      };
        
        if (!wallet) {
            return {
                status: 500,
                error: 'Wallet is not configured'
            };
        }

      (wallet.sendTransaction as jest.Mock).mockResolvedValue(mockTx);

      const result = await EthereumService.sendTransaction(mockTo, mockAmount);

      expect(result).toEqual({
        status: 200,
        data: {
          hash: mockTx.hash,
          from: mockTx.from,
          to: mockTx.to,
          amount: mockAmount,
          currency: 'ETH',
        },
      });
    });

    it('should handle errors when sending transaction', async () => {
              if (!wallet) {
            return {
                status: 500,
                error: 'Wallet is not configured'
            };
        }
      
        (wallet.sendTransaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'));

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
        hash: mockHash,
        from: '0x123',
        to: '0x456',
        value: ethers.parseEther('1.0'),
        blockNumber: 123,
        confirmations: jest.fn().mockResolvedValue(10),
      };

      (provider.getTransaction as jest.Mock).mockResolvedValue(mockTx);

      const result = await EthereumService.getTransaction(mockHash);

      expect(result).toEqual({
        status: 200,
        data: {
          hash: mockTx.hash,
          from: mockTx.from,
          to: mockTx.to,
          amount: '1.0',
          currency: 'ETH',
          blockNumber: mockTx.blockNumber,
          confirmations: 10,
        },
      });
    });

    it('should handle transaction not found', async () => {
      (provider.getTransaction as jest.Mock).mockResolvedValue(null);

      const result = await EthereumService.getTransaction(mockHash);

      expect(result).toEqual({
        status: 404,
        error: 'Transaction not found',
      });
    });
  });

  describe('getBlockNumber', () => {
    it('should get block number successfully', async () => {
      const mockBlockNumber = 12345;
      (provider.getBlockNumber as jest.Mock).mockResolvedValue(mockBlockNumber);

      const result = await EthereumService.getBlockNumber();

      expect(result).toEqual({
        status: 200,
        data: {
          blockNumber: mockBlockNumber,
        },
      });
    });

    it('should handle errors when getting block number', async () => {
      (provider.getBlockNumber as jest.Mock).mockRejectedValue(new Error('Failed to get block number'));

      const result = await EthereumService.getBlockNumber();

      expect(result).toEqual({
        status: 500,
        error: 'Failed to get block number: Failed to get block number',
      });
    });
  });

  describe('getGasPrice', () => {
    it('should get gas price successfully', async () => {
      const mockFeeData = {
        gasPrice: ethers.parseUnits('50', 'gwei'),
        maxFeePerGas: null,
        maxPriorityFeePerGas: null,
      };
      (provider.getFeeData as jest.Mock).mockResolvedValue(mockFeeData);

      const result = await EthereumService.getGasPrice();

      expect(result).toEqual({
        status: 200,
        data: {
          gasPrice: ethers.formatUnits(mockFeeData.gasPrice, 'gwei'),
          maxFeePerGas: mockFeeData.maxFeePerGas,
          maxPriorityFeePerGas: mockFeeData.maxPriorityFeePerGas,
        },
      });
    });

    it('should handle errors when getting gas price', async () => {
      (provider.getFeeData as jest.Mock).mockRejectedValue(new Error('Failed to get gas price'));

      const result = await EthereumService.getGasPrice();

      expect(result).toEqual({
        status: 500,
        error: 'Failed to get gas price: Failed to get gas price',
      });
    });
  });
});
