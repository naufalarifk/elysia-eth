import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: './src/.env' });

// Configure provider (use environment variables in production)
export const provider = new ethers.JsonRpcProvider(
  process.env.ETH_RPC_URL || 'http://localhost:8545'
);

// Function to create a wallet instance
const createWallet = () => {
  const privateKey = process.env.PRIVATE_KEY;
  console.log('Environment variables loaded:', {
    ETH_RPC_URL: process.env.ETH_RPC_URL,
    PRIVATE_KEY: privateKey ? '**present**' : '**missing**',
    CHAIN_ID: process.env.CHAIN_ID,
    NETWORK_NAME: process.env.NETWORK_NAME
  });

  if (!privateKey) {
    console.warn('No private key provided. Some functionality will be limited.');
    return null;
  }
  try {
    return new ethers.Wallet(privateKey, provider);
  } catch (error) {
    console.error('Invalid private key provided:', error);
    return null;
  }
};

// Export wallet instance
export const wallet = createWallet();

// Network configuration
export const networkConfig = {
  chainId: parseInt(process.env.CHAIN_ID || '1'), // 1 for Ethereum mainnet
  networkName: process.env.NETWORK_NAME || 'mainnet',
};
