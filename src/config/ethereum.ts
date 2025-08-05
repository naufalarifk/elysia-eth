import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config({ path: './src/.env' });

export const provider = new ethers.JsonRpcProvider(
  process.env.ETH_RPC_URL || 'http://localhost:8545'
);

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

export const wallet = createWallet();

export const networkConfig = {
  chainId: parseInt(process.env.CHAIN_ID || '1'),
  networkName: process.env.NETWORK_NAME || 'mainnet',
};
